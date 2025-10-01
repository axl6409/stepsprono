import { useEffect, useRef } from "react";

const EMOJI = "🤫";
const EMOJI_SIZE = 40;

const ShhhBackground = ({
                          emojiCount = 15,
                          fadeSpeed = 0.02, // vitesse apparition/disparition
                          className = "",
                        }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationFrameId;
    let isActive = true;

    // Création d’un émoji aléatoire
    const createEmoji = () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      opacity: 0,
      appearing: true, // si true → fade in, sinon fade out
    });

    let emojis = [];

    const setCanvasSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const resetEmojis = () => {
      emojis = Array.from({ length: emojiCount }, createEmoji);
    };

    const drawEmojis = () => {
      if (!isActive) return;

      context.clearRect(0, 0, width, height);
      context.font = `${EMOJI_SIZE}px serif`;
      context.textAlign = "center";
      context.textBaseline = "middle";

      emojis.forEach((emoji, index) => {
        // mise à jour opacité
        if (emoji.appearing) {
          emoji.opacity += fadeSpeed;
          if (emoji.opacity >= 1) {
            emoji.opacity = 1;
            emoji.appearing = false; // commence à disparaître
          }
        } else {
          emoji.opacity -= fadeSpeed;
          if (emoji.opacity <= 0) {
            // recrée à un autre endroit
            emojis[index] = createEmoji();
          }
        }

        context.globalAlpha = emoji.opacity;
        context.fillText(EMOJI, emoji.x, emoji.y);
      });

      context.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(drawEmojis);
    };

    const handleResize = () => {
      setCanvasSize();
      resetEmojis();
    };

    const startAnimation = () => {
      if (!isActive) return;
      setCanvasSize();
      resetEmojis();
      window.addEventListener("resize", handleResize);
      drawEmojis();
    };

    startAnimation();

    return () => {
      isActive = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [emojiCount, fadeSpeed]);

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