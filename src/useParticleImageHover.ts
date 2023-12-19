import { useRef, useEffect } from "react";
import useCanvasImage from "src/useCanvasImage.js";

export type Options = {
  quality?: number;
  radius?: number;
  forceSpeed?: number;
  returnSpeed?: number;
};

const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
  const distanceFromMouseX = x1 - x2;
  const distanceFromMouseY = y1 - y2;
  const distanceFromMouse = Math.sqrt(
    distanceFromMouseX ** 2 + distanceFromMouseY ** 2
  );
  return {
    x: distanceFromMouseX,
    y: distanceFromMouseY,
    distance: distanceFromMouse,
  };
};

export default function useParticleImageHover({
  quality = 4,
  radius = 50,
  forceSpeed = 5,
  returnSpeed = 0.1,
}: Options = {}) {
  const {
    canvasRef,
    ratioRef,
    canvasRectRef,
    particlesRef,
    drawParticles,
    ...rest
  } = useCanvasImage({ quality });
  const mousePositionRef = useRef({
    x: Infinity,
    y: Infinity,
  });
  const frameRef = useRef(0);

  const FORCE_RADIUS = radius; // hover radius
  const FORCE_SPEED = forceSpeed; // push speed
  const RETURN_SPEED = returnSpeed; // recover speed

  const updateParticles = () => {
    const particles = particlesRef.current;
    const mousePosition = mousePositionRef.current;

    const { x: mouseOffsetX, y: mouseOffsetY } = mousePosition;
    particles.forEach((particle) => {
      const {
        x: distanceFromMouseX,
        y: distanceFromMouseY,
        distance: distanceFromMouse,
      } = getDistance(mouseOffsetX, mouseOffsetY, particle.x, particle.y);
      // within mouse hover radius
      if (distanceFromMouse < FORCE_RADIUS) {
        // push particle
        const force = (FORCE_RADIUS - distanceFromMouse) / FORCE_RADIUS;
        const angle = Math.atan2(distanceFromMouseY, distanceFromMouseX);
        const moveX = Math.cos(angle) * force * FORCE_SPEED;
        const moveY = Math.sin(angle) * force * FORCE_SPEED;
        // NOTICE: minus here to push out
        particle.x -= moveX;
        particle.y -= moveY;
      } else if (
        particle.x !== particle.originX ||
        particle.y !== particle.originY
      ) {
        // > hover radius & not in original position
        const {
          x: distanceFromOriginX,
          y: distanceFromOriginY,
          distance: distanceFromOrigin,
        } = getDistance(
          particle.originX,
          particle.originY,
          particle.x,
          particle.y
        );
        const angle = Math.atan2(distanceFromOriginY, distanceFromOriginX);
        const moveX = Math.cos(angle) * distanceFromOrigin * RETURN_SPEED;
        const moveY = Math.sin(angle) * distanceFromOrigin * RETURN_SPEED;
        particle.x += moveX;
        particle.y += moveY;
      }
    });
  };

  const drawCanvas = () => {
    updateParticles();
    drawParticles();
    frameRef.current = requestAnimationFrame(drawCanvas);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const handleMouseMove = (event: MouseEvent | TouchEvent) => {
        const rect = canvasRectRef.current as DOMRect;
        const ratio = ratioRef.current;
        const touch = (event as TouchEvent).touches?.[0] || event;
        mousePositionRef.current = {
          x:
            (touch.pageX - rect.left - window.pageXOffset || window.scrollX) *
            ratio,
          y:
            (touch.pageY - rect.top - window.pageYOffset || window.scrollY) *
            ratio,
        };
      };
      const handleMouseLeave = () => {
        mousePositionRef.current = {
          x: Infinity,
          y: Infinity,
        };
      };
      canvas.addEventListener("mousemove", handleMouseMove, { passive: true });
      canvas.addEventListener("mouseleave", handleMouseLeave);
      canvas.addEventListener("touchmove", handleMouseMove);
      canvas.addEventListener("touchend", handleMouseLeave);
      return () => {
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mouseleave", handleMouseLeave);
        canvas.removeEventListener("touchmove", handleMouseMove);
        canvas.removeEventListener("touchend", handleMouseLeave);
      };
    }
  }, []);

  return {
    ...rest,
    canvasRef,
    ratioRef,
    canvasRectRef,
    particlesRef,
    frameRef,
    drawParticles,
    drawCanvas,
  };
}
