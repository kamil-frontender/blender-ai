/skill:3d-landing Прочитай AGENTS.md и docs/brief.md.
Собери минимально полный лендинг NEXUS в корне проекта.



Обязательное:
- Next.js App Router, TypeScript и Tailwind;
- отдельный client component для Canvas;
- загрузка `/models/ai-core.glb` через `useGLTF`;
- полноэкранный hero: текст слева, AI Core справа;
- camera около [0, 0, 4.5], мягкий свет без тяжёлого postprocessing;
- очень небольшая реакция объекта на mouse/pointer;
- отключить постоянную анимацию при `prefers-reduced-motion`;
- на ширине 375 px сначала текст и CTA, затем 3D;
- спокойный DOM fallback, если WebGL или GLB не загрузился;
- ниже hero: три capabilities, короткий workflow и финальный CTA;
- никаких внешних изображений и новых продуктовых функций.



Сначала покажи план и список файлов. Затем реализуй.
В конце запусти lint и build, исправь ошибки и перечисли изменённые файлы.