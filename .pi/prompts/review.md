Работай как reviewer. Не редактируй файлы.

1. Прочитай AGENTS.md и docs/brief.md.
2. В приложении запусти `npm run lint` и `npm run build`.
3. Проверь размер `public/models/ai-core.glb`.
4. Проверь код на: client/server boundary, загрузку GLB, fallback,
   reduced motion, responsive layout и отсутствие лишних зависимостей.
5. Сверь тексты, секции и визуальные ограничения с brief.



Верни строго:
VERDICT: PASS или FAIL
BLOCKERS: список
MAJOR: список
MINOR: список
EVIDENCE: команды и результаты

PASS разрешён только если BLOCKERS и MAJOR пусты, lint и build проходят.