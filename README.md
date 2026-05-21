# 2D Game Test

Prototipo de juego 2D/2.5D hecho con Next.js, React Three Fiber y Rapier.

El proyecto incluye:

- Movimiento del personaje con teclado y click/touch.
- Escalado del sprite por profundidad (efecto de perspectiva en escena 2.5D).
- Escenas intercambiables con límites de suelo y muros.
- Modo debug con editor visual de muros y suelo.
- Atlas de sprites con animaciones direccionales.

## Stack técnico

- Next.js 16 + React 19 + TypeScript
- Three.js + @react-three/fiber + @react-three/drei
- @react-three/rapier (físicas y colisiones)
- Zustand (estado global de escena)
- Tailwind CSS v4 (base global)

## Requisitos

- Node.js 20+
- npm 10+ (o equivalente)

## Instalación

```bash
npm install
```

## Scripts

```bash
npm run dev    # entorno de desarrollo
npm run dev:debug # desarrollo local con ruta /debug habilitada
npm run build  # build de producción
npm run start  # servir build de producción
npm run lint   # lint con ESLint
```

## Arranque rápido

1. Levanta el servidor:

```bash
npm run dev
```

2. Abre:

- `http://localhost:3000`

## Controles

- Movimiento: `WASD` o flechas
- Movimiento por click/touch: click en el plano jugable
- Respawn: botón `Reaparecer en spawn`

El personaje activo y la escena se cambian desde el panel de control en pantalla.

## Modo debug

El modo debug está pensado solo para desarrollo local.

Tienes dos opciones:

1. Opción rápida (recomendada):

```bash
npm run dev:debug
```

2. Opción manual:

- Crea un `.env.local` en la raíz (puedes copiar `.env.example`).
- Activa la variable:

```bash
NEXT_PUBLIC_ENABLE_DEBUG=true
```

3. Arranca en desarrollo y entra a:

- `http://localhost:3000/debug`

Notas:

- En producción, `/debug` devuelve 404 aunque la variable exista.
- Si `NEXT_PUBLIC_ENABLE_DEBUG` no está en `true`, la ruta `/debug` queda desactivada.

Con debug activo tienes:

- Mostrar/ocultar visuales de suelo
- Mostrar/ocultar visuales de muros
- Editor de muros:
  - Crear/borrar muro
  - Seleccionar muro
  - Editar posición, tamaño (`halfSize`) y rotación Y
  - Arrastrar wireframe/handles en viewport
  - Copiar JSON para persistir en `app/scenes/scenes.ts`
- Editor de suelo:
  - Editar `minX`, `maxX`, `minZ`, `maxZ`, `y`
  - Ver ancho/fondo calculados
  - Copiar JSON para persistir en `app/scenes/scenes.ts`

## Estructura del proyecto

```text
app/
	page.tsx                     # entrada principal (renderiza GameTouchCanvas)
	layout.tsx                   # layout global y fuentes
	globals.css                  # estilos globales
	components/
		GameTouchCanvas.tsx        # escena principal con físicas + debug/editor
		GameCanvas.tsx             # canvas alternativo más simple (2D plano)
		MouseCursor.tsx            # cursor pixel personalizado (desktop)
		PixelSelect.tsx            # selector visual retro
		sprite/
			AnimatedSprite.tsx       # reproducción de atlas por frames
			clips.ts                 # definición de clips y personajes
	scenes/
		scenes.ts                  # definición de escenas (spawn, suelo, muros)
	store/
		sceneStore.ts              # estado global de escena con Zustand

public/
	assets/
		background/                # fondos por escena
		sprites/                   # atlas de sprites
```

## Flujo de trabajo recomendado para editar escenas

1. Arranca en debug (`/debug` con `NEXT_PUBLIC_ENABLE_DEBUG=true`).
2. Ajusta muros y/o suelo visualmente.
3. Usa `Copiar JSON` en el panel correspondiente.
4. Pega el resultado en la escena de `app/scenes/scenes.ts`.
5. Guarda y valida colisiones en runtime.

## Notas de implementación

- El estado de escena se clona al cambiar de escena para evitar mutaciones accidentales.
- El personaje se reposiciona en `playerSpawn` al cambiar de escena o al hacer respawn.
- La velocidad vertical (eje Z) está aumentada respecto al eje X para compensar la percepción en cámara ortográfica inclinada.
- El sprite ajusta escala por profundidad entre límites configurados, simulando alejamiento/cercanía.

## Deploy

Build y arranque en producción:

```bash
npm run build
npm run start
```

Puedes desplegar en cualquier entorno compatible con Next.js (por ejemplo Vercel).
