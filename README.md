# DMIRALUXE — The Office

A luxury office experience with a procedural, first-person 3D walkthrough and scrollable editorial sections. The office geometry is built in Three.js / React Three Fiber, with its room sequence and proportions interpreted from `public/images/office-reference.jpg`. The reference is also used in the optional floor-map overlay, never as the 3D scene background.

## Run locally

```bash
npm install
npm run dev
```

## Walkthrough controls

- **W / A / S / D:** Walk
- **Mouse:** Look around (click to capture the pointer; drag to look without capture)
- **Shift:** Walk faster
- **Esc:** Return to the intro
- **Mobile:** Move with the virtual joystick and swipe the scene to look around
- **Floor Map:** Open the reference-plan overlay and see an approximate position marker
- **Room markers:** Click a room label to move to its entry
- **Scroll:** Use the scroll cue, trackpad, or wheel to continue into the website sections. Scrolling while the mouse is captured releases pointer lock and moves the page.

## Architecture and model replacement

`src/scenes/OfficeEnvironment.tsx` builds the office from real geometry: marble-textured floor surfaces, architectural walls and glass partitions, room-specific ceilings, doors, furniture, stairs, lift cores, planting and warm lighting. `src/config/officeLayout.ts` keeps room centers, spawn points and collision bounds in the reference image's spatial coordinate system.

To use a coordinate-aligned office GLB, put it at `public/models/dmiraluxe-office.glb` and set `useExternalModel` to `true` in `src/config/modelConfig.ts`. Keep the same world origin, floor level and orientation; update room locations and collisions to match the replacement model.

## Build

```bash
npm run build
npm run preview
```
