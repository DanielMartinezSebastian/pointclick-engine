#!/usr/bin/env node

/**
 * Driver for Point & Click 2D Game Engine Demo
 *
 * Programmatic interface for agents to:
 * - Start the dev server
 * - Wait for readiness
 * - Verify the app responds
 * - Run tests
 * - Clean up
 *
 * Usage:
 *   node driver.mjs start     # Start dev server (blocks until ready)
 *   node driver.mjs health    # Check app health
 *   node driver.mjs test      # Run test suite
 *   node driver.mjs stop      # Kill dev server
 */

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import http from 'http';
import fs from 'fs';
import path from 'path';

const execPromise = promisify(exec);

const STATE = {
  devPid: null,
  startedAt: null,
};

const PORT = 3000;
const REPO_ROOT = process.cwd();

// ============================================================================
// Health Check
// ============================================================================

async function checkHealth() {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${PORT}/`, (res) => {
      resolve(res.statusCode === 200);
      res.on('data', () => {}); // Consume response
      res.on('end', () => {});
    });
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// ============================================================================
// Start Dev Server
// ============================================================================

async function startDevServer() {
  console.log(`[driver] Starting dev server on port ${PORT}...`);

  const devProc = spawn('npm', ['run', 'dev'], {
    cwd: REPO_ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false, // Don't detach; keep it managed
  });

  STATE.devPid = devProc.pid;
  STATE.startedAt = Date.now();

  // Log output (optional)
  devProc.stdout.on('data', (data) => {
    const msg = data.toString().trim();
    if (msg.includes('Ready in') || msg.includes('error') || msg.includes('Failed')) {
      console.log(`[next] ${msg}`);
    }
  });

  devProc.stderr.on('data', (data) => {
    console.error(`[next-err] ${data.toString().trim()}`);
  });

  devProc.on('exit', (code) => {
    if (code !== null && code !== 0) {
      console.error(`[driver] Dev server exited with code ${code}`);
    }
    STATE.devPid = null;
  });

  // Wait for readiness (up to 30s)
  console.log('[driver] Waiting for app to be ready...');
  let ready = false;
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    if (await checkHealth()) {
      ready = true;
      break;
    }
  }

  if (!ready) {
    throw new Error('Dev server did not become ready within 30s');
  }

  console.log(`✓ Dev server ready on http://localhost:${PORT}`);
  return devProc;
}

// ============================================================================
// Stop Dev Server
// ============================================================================

async function stopDevServer() {
  if (!STATE.devPid) {
    console.log('[driver] Dev server not running');
    return;
  }

  console.log(`[driver] Stopping dev server (PID ${STATE.devPid})...`);

  try {
    process.kill(STATE.devPid, 'SIGTERM');
    // Wait a moment for graceful shutdown
    await new Promise((r) => setTimeout(r, 2000));
  } catch (e) {
    console.warn(`[driver] Failed to kill gracefully: ${e.message}`);
  }

  STATE.devPid = null;
  console.log('✓ Dev server stopped');
}

// ============================================================================
// Run Tests
// ============================================================================

async function runTests() {
  console.log('[driver] Running test suite...');

  try {
    const { stdout, stderr } = await execPromise('npm test 2>&1', {
      cwd: REPO_ROOT,
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer for test output
    });

    // Parse output for pass/fail counts (get the LAST occurrence for final result)
    const passMatches = stdout.match(/(\d+)\s+passed/g);
    const failMatches = stdout.match(/(\d+)\s+failed/g);

    // Extract the last pass count (final summary)
    const passMatch = passMatches ? passMatches[passMatches.length - 1] : null;
    const failMatch = failMatches ? failMatches[failMatches.length - 1] : null;

    const passed = passMatch ? parseInt(passMatch.match(/\d+/)[0], 10) : 0;
    const failed = failMatch ? parseInt(failMatch.match(/\d+/)[0], 10) : 0;

    if (failed > 0) {
      console.error(`✗ Tests failed: ${failed} failed, ${passed} passed`);
      console.error(stdout);
      return false;
    }

    console.log(`✓ All tests passed: ${passed} passed`);
    return true;
  } catch (error) {
    console.error(`✗ Test run failed: ${error.message}`);
    return false;
  }
}

// ============================================================================
// Build
// ============================================================================

async function build() {
  console.log('[driver] Building all packages...');

  try {
    const { stdout } = await execPromise('npm run build 2>&1', {
      cwd: REPO_ROOT,
      maxBuffer: 10 * 1024 * 1024,
    });

    if (stdout.includes('error')) {
      console.error('✗ Build failed with errors');
      console.error(stdout);
      return false;
    }

    console.log('✓ Build completed successfully');
    return true;
  } catch (error) {
    console.error(`✗ Build failed: ${error.message}`);
    return false;
  }
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'start':
      await startDevServer();
      // Keep the dev server running; don't exit
      console.log('[driver] Dev server running. Press Ctrl-C to stop.');
      break;

    case 'health':
      const health = await checkHealth();
      console.log(health ? '✓ App is healthy' : '✗ App is not responding');
      process.exit(health ? 0 : 1);
      break;

    case 'test':
      const testPass = await runTests();
      process.exit(testPass ? 0 : 1);
      break;

    case 'build':
      const buildPass = await build();
      process.exit(buildPass ? 0 : 1);
      break;

    case 'stop':
      await stopDevServer();
      break;

    case 'verify':
      // Full verification flow: build -> start -> health -> test -> stop
      try {
        console.log('\n[driver] === Full Verification ===\n');

        const buildOk = await build();
        if (!buildOk) {
          console.error('\n✗ Build verification failed');
          process.exit(1);
        }

        const { stdout: gitLog } = await execPromise('git log --oneline -1', {
          cwd: REPO_ROOT,
        });
        console.log(`Current commit: ${gitLog.trim()}`);

        console.log('\nStarting dev server...');
        const devProc = await startDevServer();

        console.log('\nChecking health...');
        const health = await checkHealth();
        if (!health) {
          throw new Error('Health check failed');
        }

        console.log('\nRunning tests...');
        const testOk = await runTests();

        console.log('\n[driver] Cleaning up...');
        await stopDevServer();

        console.log(`\n[driver] === Verification Complete ===`);
        console.log(`Build: ✓`);
        console.log(`Health: ✓`);
        console.log(`Tests: ${testOk ? '✓' : '✗'}`);
        console.log(`Duration: ${((Date.now() - STATE.startedAt) / 1000).toFixed(1)}s`);

        process.exit(testOk ? 0 : 1);
      } catch (error) {
        console.error(`\n✗ Verification failed: ${error.message}`);
        if (STATE.devPid) {
          await stopDevServer();
        }
        process.exit(1);
      }
      break;

    default:
      console.log(`Usage: node driver.mjs [start|health|test|build|stop|verify]`);
      console.log(`  start   - Start dev server (blocks; Ctrl-C to stop)`);
      console.log(`  health  - Check if app is responding`);
      console.log(`  test    - Run test suite`);
      console.log(`  build   - Build all packages`);
      console.log(`  stop    - Stop the dev server`);
      console.log(`  verify  - Full verification (build -> start -> health -> test)`);
      process.exit(0);
  }
}

main().catch((error) => {
  console.error(`Fatal error: ${error.message}`);
  process.exit(1);
});
