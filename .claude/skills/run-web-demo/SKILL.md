---
name: run-web-demo
description: Build and run the Point & Click 2D game engine demo (Next.js + R3F). Launch dev server, run tests, verify game mechanics.
---

# Run: Web Demo (Point & Click Game Engine)

A Point & Click 2D game engine with a working demo built on Next.js + React Three Fiber (R3F). The demo includes item placement, inventory mechanics, scene transitions, and pathfinding. Built as a monorepo with three packages: `engine-core` (agnostic), `engine-renderer-r3f` (R3F adapter), and `web-demo` (Next.js app).

**Driver:** Background `npm run dev` + HTTP health checks via `curl`. The app runs on `http://localhost:3000`.

---

## Prerequisites

- **Node.js** 18+
- **npm** 9+
- Git (for version control)

No system packages required. All dependencies install via npm.

```bash
node --version          # v24+ in this environment
npm --version          # v11+ in this environment
git --version          # Required
```

---

## Build

```bash
cd /path/to/2d-game-test  # Root of the monorepo

# Install dependencies across all packages
npm install

# Build all packages (engine-core, engine-renderer-r3f, web-demo)
npm run build

# Expected output: 3 packages compile without errors, tests pass (35/35)
npm test
```

**What happens:**
- `packages/engine-core/` compiles to JS + TypeScript declarations
- `packages/engine-renderer-r3f/` compiles R3F renderer adapter
- `apps/web-demo/` runs Next.js build (prerendering static pages)

All steps should complete in <2min. If any fail, see Troubleshooting.

---

## Run: Development Server (Agent Path)

Start the development server. The app will be live-reloadable on code changes.

```bash
cd /path/to/2d-game-test

# Start the dev server (port 3000, or 3001 if 3000 is in use)
npm run dev

# Wait for "Ready in XXms" message, then verify with:
curl -s http://localhost:3000 | head -1  # Should return HTML doctype

# Keep the server running in the background or a separate terminal
```

**Health check:**
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
# Expect: 200
```

**Access the app:**
- Browser (if GUI available): `http://localhost:3000`
- Programmatic: `curl http://localhost:3000` returns HTML; assets load from `/_next/static/`

**Interactive surface:** Once loaded, the app shows:
- A 3D scene rendered in Canvas (via Three.js)
- A player character (David sprite) in a town scene
- Interactive NPCs and objects (can move, talk, pick up items)
- Inventory UI in the top-left corner
- Debug overlay with scene, state, and rules info (toggle with `D`)

---

## Run: Production Build (Human Path)

If running a human session with a GUI:

```bash
npm run build   # Full build
npm run start   # Start production server (port 3000)

# Open browser to http://localhost:3000
# Quit: Ctrl-C in the terminal
```

Note: Production mode requires a browser to see the game. Headless verification uses the dev server.

---

## Test

Run the test suite to verify core logic (rules, pathfinding, state, API):

```bash
npm test

# Expected output:
#  Test Files  ✓ 3 passed (3)
#       Tests  ✓ 35 passed (35)
#    Duration  ~4s
```

If tests fail, see Troubleshooting.

---

## Agent Interaction Script

For an agent to launch the dev server and verify the game works:

```bash
# 1. Start the dev server in background
cd /path/to/2d-game-test
npm run dev > /tmp/dev.log 2>&1 &
DEV_PID=$!

# 2. Wait for readiness
sleep 6
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q 200 && echo "✓ App ready" || echo "✗ App failed"

# 3. Verify game mechanics (run tests)
npm test 2>&1 | grep -E "(passed|failed)"

# 4. Clean up
kill $DEV_PID 2>/dev/null
```

---

## Gotchas

### Port 3000 Already in Use
If you see `⚠ Port 3000 is in use... using available port 3001 instead`:
- The dev server binds to 3001 instead (no error, just a warning)
- Adjust curl/client code to use `http://localhost:3001`
- To reclaim port 3000: `lsof -ti:3000 | xargs kill -9` (macOS/Linux) or `taskkill /PID <pid> /F` (Windows)

### Build Output Not Updating
If you run `npm run build` and the `.next/` folder is stale:
```bash
rm -rf .next apps/web-demo/.next    # Clean build artifacts
npm run build                       # Rebuild
```

### Canvas Not Rendering (Blank Screen)
Usually means assets didn't load. Check:
1. Dev server is running: `curl http://localhost:3000` returns HTML
2. Browser console for 404 errors on `/_next/static/` files
3. If using Windows, ensure long file paths are enabled: no path >260 chars

### Tests Fail with Type Errors
If `npm test` fails with "Cannot find name 'PlacedSceneItem'" or similar:
```bash
npm run build   # Rebuild all packages (type defs must be current)
npm test
```

### Engine-Core or Engine-Renderer-R3F Changes Don't Show Up in Demo
After editing `packages/engine-core/` or `packages/engine-renderer-r3f/`:
```bash
npm run build           # Rebuild packages
npm run dev --workspace=web-demo  # Restart dev server with fresh imports
```

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `npm: command not found` | Install Node.js 18+ from nodejs.org or use `nvm` |
| `ENOENT: no such file or directory, open 'package.json'` | Run from repo root: `cd /path/to/2d-game-test` |
| `npm install` fails with EOPNOTSUPP or missing optional deps | Safe to ignore; optional. If critical, try `npm ci --ignore-scripts` |
| `npm run build` fails with TypeScript errors | Check `npm test` for details. Type defs in `packages/engine-core/` must be fresh. Try `npm run build --workspaces --if-present` |
| Dev server hangs on startup | Try killing any lingering Node process: `pkill -f "next dev"` then retry |
| App loads but canvas is blank | Check browser DevTools > Console for errors. Usually missing texture or shader file. Try hard refresh (Ctrl-Shift-R) or clear `.next/` cache (see Gotchas) |
| Inventory UI shows but game logic doesn't work | Run `npm test` to check core logic. If tests pass, issue is in R3F adapter. Check browser console for error details |
| "Cannot find module '@pointclick-engine/engine-core'" in web-demo | Run `npm run build` first to generate dist/ folders and type defs |

---

## Summary

1. **Install**: `npm install`
2. **Build**: `npm run build` (core + renderer + demo)
3. **Test**: `npm test` (verify 35/35 pass)
4. **Run dev**: `npm run dev` (live-reload on port 3000)
5. **Verify**: `curl http://localhost:3000` returns HTML
6. **Interact**: Once running, open a browser to the URL or use the agent script above to drive the app programmatically

---

## Game Features (What to Verify)

When the app is running, verify these mechanics work:

- ✅ **Scene Transitions**: Walk to the bridge → transition to new scene
- ✅ **Item Pickup/Drop**: Pick up trophy → drop on pedestal → return to start
- ✅ **Inventory UI**: Item appears in top-left inventory slots when picked up
- ✅ **Pathfinding**: Click on ground → player walks to location (no clipping walls)
- ✅ **Collision**: Walk into an NPC or object → stops at boundary
- ✅ **Dialogs**: Talk to NPCs → speech bubble or dialog UI appears
- ✅ **Debug Overlay**: Press `D` → shows scene state, rules log, entity list

The engine is stable for v0.1.0 (see version in `package.json`). Phase 9 (placed items refactoring) is complete: types are unified in core, dialog keys are agnostic, and stores are framework-independent.
