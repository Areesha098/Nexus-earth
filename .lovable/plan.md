# Earth-01 → Cinematic AAA Simulation Upgrade

Transform the current dashboard into a full cinematic strategy-game experience. Keep the existing game logic (stats, events, history, results) but rebuild the presentation layer.

## 1. Real 3D Earth (Three.js)

Replace `src/components/Earth.tsx` with a Three.js scene using `@react-three/fiber` + `@react-three/drei` + `three`.

Features:
- Sphere with realistic day texture + night-lights texture blended by sun direction (custom shader material) → gives day/night cycle
- Second slightly larger sphere with transparent cloud texture, rotating faster
- Atmosphere: back-side fresnel shader sphere for blue rim glow
- Slow auto-rotation + subtle camera dolly/orbit (OrbitControls with damping, autoRotate)
- Starfield via `<Stars>` from drei + drifting particle layer
- Reactive props: `health` (0–1) tints atmosphere (blue → orange/red as stats collapse), `pulse` triggers a shockwave ring on decisions
- Textures loaded from CDN (three.js example assets) so no local asset pipeline needed

New files:
- `src/components/earth/Earth3D.tsx` (Canvas wrapper)
- `src/components/earth/EarthGlobe.tsx` (sphere + shader)
- `src/components/earth/Atmosphere.tsx`
- `src/components/earth/Clouds.tsx`
- `src/components/earth/SpaceFX.tsx` (particles/shooting stars)

Dependencies to add: `three`, `@react-three/fiber`, `@react-three/drei`.

## 2. Cinematic Opening Scene

Rebuild `src/routes/index.tsx` as a timed intro sequence (framer-motion + a small step state machine):

1. Pure black, faint audio-less "boot" text lines typing in: `BOOTING EARTH-01 // NEURAL LINK ESTABLISHED // COMMANDER ID: ███`
2. Starfield fades in
3. Earth3D fades/scales in from distance with camera pulling back
4. Title reveal: **"YEAR 2026"** huge, then subtitle **"Humanity's Last Century Begins"**
5. AI Commander HUD frame draws in (corner brackets, scan-lines, radar sweep)
6. CTA: `INITIATE SIMULATION` (glitch/neon button) → `/command`

`Skip intro` button always visible top-right.

## 3. Command Deck (upgrade `command.tsx`)

Keep current data, redesign presentation:
- Full-bleed Earth3D as the background/hero (not a boxed image)
- Floating holographic HUD panels (glass + neon borders, corner brackets, subtle flicker) overlaid around Earth
- Left rail: 6 stat gauges as animated radial holograms
- Right rail: AI Foresight panel + recent orders
- Bottom command bar: cycle year, decisions counter, `SCAN FOR GLOBAL EVENT` primary neon button
- Earth reacts to average stat (color tint + rotation speed)

## 4. Immersive Event Scenarios (upgrade `event.tsx`)

Turn each event into a 3-beat cinematic:

**Beat A – Alert (1.2s):** Full-screen red alert overlay, animated `⚠ GLOBAL EVENT DETECTED`, siren scanlines, event category chip pulsing, camera shake.

**Beat B – Briefing:** Full-screen disaster image with Ken Burns zoom + parallax, title/subtitle typewriter, narrative fades in over darkened lower third.

**Beat C – AI Core Prediction:** Center hologram of a rotating wireframe brain/orb (Three.js icosahedron with wireframe + emissive shader) with typing text:
- `ANALYZING MILLIONS OF POSSIBLE FUTURES...`
- Progress bar with simulated probability streams
- Reveals the 3 directive cards one by one with stagger

**Beat D – Decision:** Existing directive cards, upgraded to holo-cards with effect chips and hover tilt. `EXECUTE DIRECTIVE` triggers a brief consequence flash (Earth pulse in the background), then routes to `/command`.

New shared component: `src/components/AICore.tsx` (Three.js hologram orb).

## 5. Design System Additions (`src/styles.css`)

- New tokens: `--holo`, `--holo-dim`, `--alert`, `--scanline-opacity`
- New utilities: `.holo-panel` (glass + neon border + corner brackets via pseudo-elements), `.scanlines-strong`, `.glitch-text`, `.hud-bracket`, `.crt-flicker`
- Keyframes: `flicker`, `scan`, `shockwave`, `type-caret`, `radar-sweep`, `alert-pulse`

## 6. Files Changed

Create:
- `src/components/earth/Earth3D.tsx`
- `src/components/earth/EarthGlobe.tsx`
- `src/components/earth/Atmosphere.tsx`
- `src/components/earth/Clouds.tsx`
- `src/components/earth/SpaceFX.tsx`
- `src/components/AICore.tsx`
- `src/components/IntroSequence.tsx`
- `src/components/EventCinematic.tsx` (wraps event flow)
- `src/components/HoloPanel.tsx`

Edit:
- `src/routes/index.tsx` — intro sequence
- `src/routes/command.tsx` — full-bleed 3D + holo HUD
- `src/routes/event.tsx` — cinematic beats
- `src/components/Earth.tsx` — becomes thin re-export of Earth3D (or delete + update imports)
- `src/components/HUDStat.tsx` — radial hologram gauge variant
- `src/styles.css` — new tokens, utilities, keyframes

Dependencies: `bun add three @react-three/fiber @react-three/drei`.

## Technical Notes

- Three.js runs client-side only — wrap `<Canvas>` mounts in a hydration guard (`useHydrated`) so SSR doesn't crash.
- Textures loaded from `https://threejs.org/examples/textures/planets/*` (earth day, night, clouds, specular). No local asset generation needed.
- Preserve all existing zustand game logic — no changes to `src/lib/game-store.ts` or `src/lib/events-data.ts`.
- Keep animations GPU-friendly: reuse geometries, `frameloop="demand"` where scenes are static.

Ready to build on approval.