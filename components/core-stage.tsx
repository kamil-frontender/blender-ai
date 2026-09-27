"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { AICoreCanvas, createInteraction } from "./ai-core-canvas";
import type { CoreFocus } from "./ai-core-canvas";

const focusModes: { key: Exclude<CoreFocus, null>; label: string }[] = [
  { key: "context", label: "Контекст" },
  { key: "tools", label: "Инструменты" },
  { key: "checks", label: "Проверки" },
];

const focusStatus: Record<Exclude<CoreFocus, null>, string> = {
  context: "Контекст · синхронизирован",
  tools: "Инструменты · 12 подключено",
  checks: "Проверки · 100% пройдено",
};

export function CoreStage() {
  const stage = useRef<HTMLDivElement>(null);
  const interactionRef = useRef(createInteraction());
  const [focus, setFocus] = useState<CoreFocus>(null);
  const [pulse, setPulse] = useState(0);
  const [visible, setVisible] = useState(true);
  const drag = useRef({ id: -1, x: 0, y: 0, moved: 0 });

  useEffect(() => {
    const node = stage.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "120px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const firePulse = () => setPulse((value) => value + 1);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const interaction = interactionRef.current;
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: 0 };
    interaction.dragging = true;
    interaction.velX = 0;
    interaction.velY = 0;
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const interaction = interactionRef.current;
    const current = drag.current;
    if (!interaction.dragging || event.pointerId !== current.id) return;
    const dx = event.clientX - current.x;
    const dy = event.clientY - current.y;
    current.x = event.clientX;
    current.y = event.clientY;
    current.moved += Math.abs(dx) + Math.abs(dy);
    if (current.moved > 6 && !event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    interaction.rotY += dx * 0.008;
    interaction.rotX += dy * 0.006;
    interaction.velY = dx * 0.0016;
    interaction.velX = dy * 0.0008;
    interaction.invalidate?.();
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    const interaction = interactionRef.current;
    if (event.pointerId !== drag.current.id) return;
    const wasClick = interaction.dragging && drag.current.moved < 6;
    interaction.dragging = false;
    drag.current.id = -1;
    if (wasClick && event.type === "pointerup") firePulse();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const interaction = interactionRef.current;
    const step = event.shiftKey ? 0.5 : 0.22;
    const actions: Record<string, () => void> = {
      ArrowLeft: () => (interaction.rotY -= step),
      ArrowRight: () => (interaction.rotY += step),
      ArrowUp: () => (interaction.rotX -= step * 0.6),
      ArrowDown: () => (interaction.rotX += step * 0.6),
      Enter: firePulse,
      " ": firePulse,
    };
    const action = actions[event.key];
    if (!action) return;
    event.preventDefault();
    action();
    interaction.invalidate?.();
  };

  return (
    <div
      className="core-stage"
      ref={stage}
      data-focus={focus ?? "none"}
      onPointerEnter={() => (interactionRef.current.hover = true)}
      onPointerLeave={() => (interactionRef.current.hover = false)}
    >
      <div className="stage-label stage-label-top">
        <span className="stage-status" aria-live="polite">
          <span aria-hidden="true" />
          <span className="stage-id" aria-hidden="true">Ядро 001 ·</span>
          {focus ? focusStatus[focus] : "Активно"}
        </span>
        <button type="button" className="stage-pulse" onClick={firePulse}>
          <span aria-hidden="true" />
          Импульс
        </button>
      </div>

      <div
        className="canvas-wrap"
        tabIndex={0}
        role="group"
        aria-roledescription="3D-сцена"
        aria-label="Интерактивная 3D-модель ядра NEXUS. Стрелки вращают модель, Enter запускает импульс."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
      >
        <AICoreCanvas visible={visible} focus={focus} pulse={pulse} interactionRef={interactionRef} />
      </div>
      <div className="stage-overlay" aria-hidden="true" />

      <p className="stage-hint" aria-hidden="true">
        Потяните, чтобы вращать · коснитесь для импульса
      </p>

      <div className="stage-label stage-label-bottom">
        <div className="stage-modes" role="group" aria-label="Подсветить слой обвязки">
          {focusModes.map((mode) => (
            <button
              key={mode.key}
              type="button"
              className="stage-chip"
              data-mode={mode.key}
              aria-pressed={focus === mode.key}
              onClick={() => setFocus((current) => (current === mode.key ? null : mode.key))}
            >
              <span aria-hidden="true" />
              {mode.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
