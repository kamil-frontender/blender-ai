export function SceneFallback({
  message = "AI Core preview",
}: {
  message?: string;
}) {
  return (
    <div className="scene-fallback" role="img" aria-label="Abstract AI Core preview">
      <div className="fallback-orbit fallback-orbit-outer" />
      <div className="fallback-orbit fallback-orbit-inner" />
      <div className="fallback-core" />
      <span>{message}</span>
    </div>
  );
}
