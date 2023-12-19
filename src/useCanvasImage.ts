import { useRef, useState, useEffect } from "react";

type Particle = {
  x: number;
  y: number;
  originX: number;
  originY: number;
  color: string; // rgba string
};

const loadImg = (url: string, crossOrigin = false): Promise<HTMLImageElement> =>
  new Promise((resolve) => {
    const img = document.createElement("img");
    img.src = url;
    img.crossOrigin = crossOrigin ? "anonymous" : null;
    img.onload = () => resolve(img);
  });

const getAveragePixelByRowCol = (
  imageData: ImageData["data"],
  width: number,
  startRow: number,
  startCol: number,
  DIAMETER = 4
) => {
  const endRow = startRow + DIAMETER;
  const endCol = startCol + DIAMETER;
  const len = DIAMETER * DIAMETER;
  let rlist = 0;
  let glist = 0;
  let blist = 0;
  let alist = 0;
  for (let r = startRow; r < endRow; r++) {
    for (let c = startCol; c < endCol; c++) {
      const pixelIndex = (r * width + c) * 4;
      rlist += imageData[pixelIndex];
      glist += imageData[pixelIndex + 1];
      blist += imageData[pixelIndex + 2];
      alist += imageData[pixelIndex + 3];
    }
  }
  const R = rlist / len;
  const G = glist / len;
  const B = blist / len;
  const A = alist / len;
  return {
    x: startCol + DIAMETER / 2,
    y: startRow + DIAMETER / 2,
    // default is same to x, y, just used for mouse movement change
    originX: startCol + DIAMETER / 2,
    originY: startRow + DIAMETER / 2,
    color: `rgba(${R}, ${G}, ${B}, ${A / 255})`,
  };
};

export default function useCanvasImage({ quality = 4 } = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>();
  const particlesRef = useRef<Particle[]>([]);
  const ratioRef = useRef(1);
  const canvasRectRef = useRef<DOMRect>();

  // DIAMETER: pixel count to optimize(4x4 or 8x8...)
  // > 1: direct use as DIAMETER
  // <= 1: transform to DIAMETER
  const DIAMETER =
    quality > 1 ? parseInt(String(quality), 10) : Math.floor(1 / quality);

  let canvasWidth = canvasRef.current?.width ?? 0;
  let canvasHeight = canvasRef.current?.height ?? 0;

  const convertToParticles = (imageData: ImageData["data"]) => {
    // get total row, col numbers
    const rowNum = Math.round(canvasHeight / DIAMETER);
    const colNum = Math.round(canvasWidth / DIAMETER);
    // get particle range by DIAMETER
    // r: row in height
    // c: column in width
    const particles = [];
    for (let row = 0; row < rowNum; row++) {
      for (let col = 0; col < colNum; col++) {
        // get real pixel row, col
        const pixelRow = row * DIAMETER;
        const pixelCol = col * DIAMETER;
        // get particle pixels avg position, color
        const particle = getAveragePixelByRowCol(
          imageData,
          canvasWidth,
          pixelRow,
          pixelCol,
          DIAMETER
        );
        particles.push(particle);
      }
    }
    return particles;
  };

  const drawParticles = () => {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    particlesRef.current.forEach((particle) => {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, DIAMETER / 2, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.fill();
    });
  };

  const initCanvas = async (url: string) => {
    const img = await loadImg(url, true);
    const { width, height } = img;
    if (!canvasRef.current || !canvasRectRef.current || !ctx) return;

    const canvas = canvasRef.current;
    canvasWidth = canvas.width = width;
    canvasHeight = canvas.height = height;
    // first mount ratio
    console.log(canvasWidth, canvasRectRef.current.width);
    ratioRef.current = canvasWidth / canvasRectRef.current.width;

    ctx.drawImage(img, 0, 0, width, height);

    const imageData = ctx.getImageData(0, 0, width, height);
    const particles = convertToParticles(imageData.data);
    particlesRef.current = particles;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    let timer: number;
    if (canvas) {
      setCtx(canvas.getContext("2d"));
      const resize = () => {
        const canvas = canvasRef.current as HTMLCanvasElement;
        canvasRectRef.current = canvas.getBoundingClientRect();
        ratioRef.current = canvas.width / canvasRectRef.current.width;
      };
      const handleResize = () => {
        clearTimeout(timer);
        timer = setTimeout(resize, 200);
      };
      resize();
      window.addEventListener("resize", handleResize, { passive: true });
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []);

  return {
    canvasRef,
    ratioRef,
    canvasRectRef,
    particlesRef,
    ctx,
    initCanvas,
    drawParticles,
  };
}
