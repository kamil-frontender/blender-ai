export function SceneFallback({
  message = "Превью ядра",
}: {
  message?: string;
}) {
  return (
    <div className="scene-fallback" role="img" aria-label="Абстрактное превью ядра NEXUS">
      <div className="fallback-orbit fallback-orbit-outer" />
      <div className="fallback-orbit fallback-orbit-inner" />
      <div className="fallback-core" />
      <span>{message}</span>
    </div>
  );
}
