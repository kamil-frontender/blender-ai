# Result Mini Harness



## Mission
Build a one-page 3D landing for the fictional product NEXUS.
Read `docs/brief.md` before planning or editing.



## Stack
- TypeScript, Next.js 16 App Router, React 19, Tailwind CSS.
- Three.js through React Three Fiber and Drei.
- The model lives at `app/public/models/ai-core.glb`.



## Working rules
1. Plan before editing.
2. Make one coherent change at a time.
3. Do not add remote assets, analytics, auth, a database or a CMS.
4. Keep 3D code inside a client component.
5. Support 390 px mobile width and reduced motion.
6. Before finishing, run `npm run lint` and `npm run build` inside `app`.



## Definition of done
- No console errors.
- The GLB loads and remains readable on mobile.
- The page works without mouse input.
- `lint` and `build` pass.
- The GLB is below 5 MB.