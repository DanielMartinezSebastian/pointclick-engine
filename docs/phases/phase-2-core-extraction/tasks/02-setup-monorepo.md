# Task 02: Setup monorepo structure

**Phase**: 2 | **Estimate**: 2h | **Owner**: —

## Context

Hoy el repo es plano (Next.js en raíz). Para extraer `engine-core`, hay que convertirlo a monorepo con npm workspaces. La demo Next.js se mueve a `apps/web-demo/`.

## Prerequisites

- [ ] Task 01 done (audit limpio o violations resueltas)
- [ ] Git status limpio (commit/stash cambios pendientes)
- [ ] Branch creado: `git checkout -b phase-2-monorepo-setup`

## Action

### 1. Crear estructura

```bash
mkdir -p packages/engine-core/src
mkdir -p apps/web-demo
```

### 2. Mover Next.js a apps/web-demo

```bash
# Mover directorios y archivos de Next.js
git mv app apps/web-demo/app
git mv public apps/web-demo/public
git mv next.config.ts apps/web-demo/next.config.ts
git mv next-env.d.ts apps/web-demo/next-env.d.ts
git mv tsconfig.json apps/web-demo/tsconfig.json
git mv postcss.config.mjs apps/web-demo/postcss.config.mjs
git mv eslint.config.mjs apps/web-demo/eslint.config.mjs
```

### 3. Crear `apps/web-demo/package.json`

Copia del actual `package.json`, quitando devDeps que serán del root:

```json
{
  "name": "@pointclick/web-demo",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "dev:debug": "cross-env NEXT_PUBLIC_ENABLE_DEBUG=true next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run"
  },
  "dependencies": {
    "@pointclick/engine-core": "workspace:*",
    "@react-three/drei": "^10.7.7",
    "@react-three/fiber": "^9.6.1",
    "@react-three/rapier": "^2.2.0",
    "@types/three": "^0.184.1",
    "gsap": "^3.15.0",
    "next": "16.2.6",
    "nipplejs": "^1.0.2",
    "pixelarticons": "^2.1.0",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "three": "^0.184.0",
    "zustand": "^5.0.13"
  }
}
```

### 4. Actualizar `package.json` raíz

Reemplazar con:

```json
{
  "name": "point-and-click-game-engine",
  "private": true,
  "workspaces": ["packages/*", "apps/*"],
  "scripts": {
    "dev": "npm run dev -w apps/web-demo",
    "dev:debug": "npm run dev:debug -w apps/web-demo",
    "build": "npm run build --workspaces --if-present",
    "test": "npm run test --workspaces --if-present",
    "lint": "npm run lint --workspaces --if-present"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "cross-env": "^7.0.3",
    "tailwindcss": "^4",
    "typescript": "^5",
    "vitest": "^3.2.4"
  }
}
```

### 5. Reinstalar dependencias

```bash
rm -rf node_modules package-lock.json
npm install
```

## Success Criteria

- [ ] `apps/web-demo/` contiene app, public, configs Next.js
- [ ] `packages/engine-core/src/` existe (vacío, se rellena en task 03)
- [ ] `npm install` exitoso sin errores
- [ ] `npm run dev` levanta web-demo en `localhost:3000`
- [ ] Demo funciona idéntica visualmente (golden path: cambiar escena, mover)
- [ ] `npm run build -w apps/web-demo` pasa

## On Complete

1. Marcar `[x]` en `../tracking.md` para `02-setup-monorepo`
2. Commit:
   ```
   chore(phase-2): convert to monorepo with workspaces

   Moved Next.js app to apps/web-demo/.
   Created packages/engine-core/ scaffold.
   Root package.json now defines workspaces.

   - [x] Marked: 02-setup-monorepo

   See docs/phases/phase-2-core-extraction/tasks/02-setup-monorepo.md
   ```

## References

- ADR: `docs/decisions/0003-monorepo-with-demo.md`

## Notes

- Si hay paths absolutos `@/app/...` en el código, **no los cambies aquí**. Eso es task 07.
- Si `tsconfig.json` paths necesitan ajuste para que `@/` apunte a `apps/web-demo/app/`, hazlo aquí.
