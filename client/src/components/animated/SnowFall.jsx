import { useEffect, useRef } from "react";

const clampSpeedRange = (minSpeed, maxSpeed) => {
  if (maxSpeed <= minSpeed) {
    return [minSpeed, minSpeed + 0.1];
  }
  return [minSpeed, maxSpeed];
};

const drawSnowflake = (context, x, y, size, color = "#FFFFFF") => {
  context.save();
  context.translate(x, y);

  // Ajouter une ombre pour rendre les flocons visibles sur fond blanc
  context.shadowColor = "rgba(0, 0, 0, 0.8)";
  context.shadowBlur = 1;
  context.shadowOffsetX = 1;
  context.shadowOffsetY = 1;

  context.strokeStyle = color;
  context.fillStyle = color;
  context.lineWidth = 2;

  // Dessiner un flocon simple avec 6 branches
  for (let i = 0; i < 6; i++) {
    context.rotate(Math.PI / 3);
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(0, -size);
    context.stroke();

    // Petites branches
    context.beginPath();
    context.moveTo(0, -size * 0.6);
    context.lineTo(-size * 0.3, -size * 0.8);
    context.stroke();

    context.beginPath();
    context.moveTo(0, -size * 0.6);
    context.lineTo(size * 0.3, -size * 0.8);
    context.stroke();
  }

  // Centre du flocon
  context.beginPath();
  context.arc(0, 0, size * 0.15, 0, Math.PI * 2);
  context.fill();

  context.restore();
};

const SnowFall = ({
  snowflakeCount = 50,
  minSpeed = 0.5,
  maxSpeed = 2,
  minSize = 5,
  maxSize = 12,
  snowflakeColor = "#000000",
  className = "",
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return undefined;
    }

    const [minVelocity, maxVelocity] = clampSpeedRange(minSpeed, maxSpeed);

    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationFrameId;
    let isActive = true;
    let snowflakes = [];

    const createSnowflake = () => {
      const size = minSize + Math.random() * (maxSize - minSize);
      return {
        x: Math.random() * width,
        y: -size * 2,
        size,
        speed: minVelocity + Math.random() * (maxVelocity - minVelocity),
        drift: (Math.random() - 0.5) * 0.5, // Dérive horizontale légère
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02, // Rotation lente
      };
    };

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

    const resetSnowflakes = () => {
      snowflakes = Array.from({ length: snowflakeCount }, createSnowflake);
    };

    const drawSnowflakes = () => {
      if (!isActive) {
        return;
      }

      context.clearRect(0, 0, width, height);

      snowflakes.forEach((snowflake, index) => {
        snowflake.y += snowflake.speed;
        snowflake.x += snowflake.drift;
        snowflake.rotation += snowflake.rotationSpeed;

        // Réinitialiser si le flocon sort de l'écran
        if (snowflake.y > height + snowflake.size * 2) {
          snowflakes[index] = createSnowflake();
        }

        // Dessiner le flocon avec rotation
        context.save();
        context.translate(snowflake.x, snowflake.y);
        context.rotate(snowflake.rotation);
        drawSnowflake(context, 0, 0, snowflake.size, snowflakeColor);
        context.restore();
      });

      animationFrameId = requestAnimationFrame(drawSnowflakes);
    };

    const handleResize = () => {
      setCanvasSize();
      resetSnowflakes();
    };

    const startAnimation = () => {
      if (!isActive) {
        return;
      }
      setCanvasSize();
      resetSnowflakes();
      window.addEventListener("resize", handleResize);
      drawSnowflakes();
    };

    startAnimation();

    return () => {
      isActive = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [snowflakeCount, maxSpeed, minSpeed, minSize, maxSize, snowflakeColor]);

  const containerClassName = className
    ? `snow-container ${className}`.trim()
    : "snow-container";

  return (
    <div className={containerClassName}>
      <canvas ref={canvasRef} className="snow-canvas" />
    </div>
  );
};

export default SnowFall;
