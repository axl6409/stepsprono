import { useEffect, useRef } from "react";
import bulletImage from "../../assets/components/animated/bullet.png";

const BULLET_SIZE = 20;

const clampSpeedRange = (minSpeed, maxSpeed) => {
  if (maxSpeed <= minSpeed) {
    return [minSpeed, minSpeed + 0.1];
  }
  return [minSpeed, maxSpeed];
};

const BulletRain = ({
                      bulletCount = 15,
                      minSpeed = 2,
                      maxSpeed = 8,
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
    const bulletImg = new Image();
    bulletImg.src = bulletImage;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationFrameId;
    let isActive = true;
    let hasStarted = false;
    let bullets = [];

    const createBullet = () => ({
      x: Math.random() * Math.max(width - BULLET_SIZE, 0),
      y: -BULLET_SIZE,
      speed: minVelocity + Math.random() * (maxVelocity - minVelocity),
      opacity: 1,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.1
    });

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

    const resetBullets = () => {
      bullets = Array.from({ length: bulletCount }, createBullet);
    };

    const drawBullets = () => {
      if (!isActive) {
        return;
      }

      context.clearRect(0, 0, width, height);
      bullets.forEach((bullet, index) => {
        bullet.y += bullet.speed;
        bullet.rotation += bullet.rotationSpeed;

        if (bullet.y > height) {
          bullets[index] = createBullet();
        }

        context.save();
        context.translate(bullet.x + BULLET_SIZE / 2, bullet.y + BULLET_SIZE / 2);
        context.rotate(bullet.rotation);
        context.drawImage(
          bulletImg,
          -BULLET_SIZE / 2,
          -BULLET_SIZE / 2,
          BULLET_SIZE,
          BULLET_SIZE
        );
        context.restore();
      });

      animationFrameId = requestAnimationFrame(drawBullets);
    };

    const handleResize = () => {
      setCanvasSize();
      resetBullets();
    };

    const startAnimation = () => {
      if (!isActive || hasStarted) {
        return;
      }
      hasStarted = true;
      setCanvasSize();
      resetBullets();
      window.addEventListener("resize", handleResize);
      drawBullets();
    };

    if (bulletImg.complete) {
      startAnimation();
    } else {
      bulletImg.onload = startAnimation;
    }

    return () => {
      isActive = false;
      bulletImg.onload = null;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (hasStarted) {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, [bulletCount, maxSpeed, minSpeed]);

  const containerClassName = className
    ? `bullet-container ${className}`.trim()
    : "bullet-container";

  return (
    <div className={containerClassName}>
      <canvas ref={canvasRef} className="bullet-canvas" />
    </div>
  );
};

export default BulletRain;