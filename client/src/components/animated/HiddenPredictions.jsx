import { useEffect, useRef } from "react";

const EMOJI = "🤫";
const EMOJI_SIZE = 30;

const ShhhBackground = ({
                          emojiCount = 15,
                          // Durées en millisecondes (tu gardes holdTime / delayTime)
                          fadeInTime = 1000,   // durée du fade-in
                          holdTime = 1500,     // durée affiché au max
                          fadeOutTime = 1000,  // durée du fade-out
                          delayTime = 500,     // délai invisible avant réapparition
                          maxOpacity = 0.6,
                          className = "",
                        }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let rafId;
    let running = true;

    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

    // Durée totale d’un cycle
    const cycleMs = delayTime + fadeInTime + holdTime + fadeOutTime;

    // Calcule une phase et un "temps dans la phase" à partir d’un offset aléatoire
    const phaseFromOffset = (offsetMs) => {
      if (offsetMs < delayTime) return ["delay", offsetMs];
      offsetMs -= delayTime;

      if (offsetMs < fadeInTime) return ["fadeIn", offsetMs];
      offsetMs -= fadeInTime;

      if (offsetMs < holdTime) return ["hold", offsetMs];
      offsetMs -= holdTime;

      // sinon fadeOut
      return ["fadeOut", offsetMs];
    };

    // Création d’un émoji avec un décalage aléatoire de phase (évite la synchro)
    const createEmoji = () => {
      const start = Date.now();
      const randomOffset = Math.random() * cycleMs;
      const [phase, phaseElapsed] = phaseFromOffset(randomOffset);

      return {
        x: Math.random() * width,
        y: Math.random() * height,
        phase,            // 'delay' | 'fadeIn' | 'hold' | 'fadeOut'
        phaseStart: start - phaseElapsed, // pour que l’emoji "soit" déjà avancé dans la phase
      };
    };

    let emojis = [];

    const setCanvasSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const resetEmojis = () => {
      emojis = Array.from({ length: emojiCount }, createEmoji);
    };

    const nextPhase = (emoji, now) => {
      if (emoji.phase === "delay") {
        emoji.phase = "fadeIn";
        emoji.phaseStart = now;
        return;
      }
      if (emoji.phase === "fadeIn") {
        emoji.phase = "hold";
        emoji.phaseStart = now;
        return;
      }
      if (emoji.phase === "hold") {
        emoji.phase = "fadeOut";
        emoji.phaseStart = now;
        return;
      }
      // fin du fadeOut → on recrée ailleurs et repart en delay
      const e = createEmoji();
      emoji.x = e.x;
      emoji.y = e.y;
      emoji.phase = "delay";
      emoji.phaseStart = now;
    };

    const opacityFor = (emoji, now) => {
      const elapsed = now - emoji.phaseStart;

      switch (emoji.phase) {
        case "delay": {
          // invisible pendant delayTime
          if (elapsed >= delayTime) nextPhase(emoji, now);
          return 0;
        }
        case "fadeIn": {
          const t = fadeInTime > 0 ? clamp(elapsed / fadeInTime, 0, 1) : 1;
          if (elapsed >= fadeInTime) nextPhase(emoji, now);
          return t * maxOpacity;
        }
        case "hold": {
          if (elapsed >= holdTime) nextPhase(emoji, now);
          return maxOpacity;
        }
        case "fadeOut": {
          const t = fadeOutTime > 0 ? clamp(elapsed / fadeOutTime, 0, 1) : 1;
          if (elapsed >= fadeOutTime) nextPhase(emoji, now);
          return (1 - t) * maxOpacity;
        }
        default:
          return 0;
      }
    };

    const draw = () => {
      if (!running) return;

      ctx.clearRect(0, 0, width, height);
      ctx.font = `${EMOJI_SIZE}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const now = Date.now();

      for (const emoji of emojis) {
        const alpha = opacityFor(emoji, now);
        if (alpha <= 0) continue;
        ctx.globalAlpha = alpha;
        ctx.fillText(EMOJI, emoji.x, emoji.y);
      }

      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(draw);
    };

    const onResize = () => {
      setCanvasSize();
      resetEmojis();
    };

    const start = () => {
      if (!running) return;
      setCanvasSize();
      resetEmojis();
      window.addEventListener("resize", onResize);
      draw();
    };

    start();

    return () => {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
    };
  }, [emojiCount, fadeInTime, holdTime, fadeOutTime, delayTime, maxOpacity]);

  const containerClassName = className
    ? `shhh-container ${className}`.trim()
    : "shhh-container";

  return (
    <div className={containerClassName}>
      <canvas ref={canvasRef} className="shhh-canvas" />
    </div>
  );
};

export default ShhhBackground;
