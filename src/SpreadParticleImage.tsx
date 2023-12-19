import React, { useEffect, CSSProperties } from 'react';
import useParticleImageHover, { Options } from 'src/useParticleImageHover.js';

export type SpreadParticleImageProps = Options & {
  id?: string;
  className?: string;
  style?: CSSProperties;
  src: string;
}

const SpreadParticleImage = (props: SpreadParticleImageProps) => {
  const { canvasRef, ctx, initCanvas, drawCanvas } = useParticleImageHover(props);

  useEffect(() => {
    if (ctx) {
      initCanvas(props.src);
      drawCanvas();
    }
  }, [ctx]);

  return (
    <canvas ref={canvasRef} id={props.id} className={props.className} style={{
      maxWidth: '100%',
      touchAction: 'none',
      ...props.style
    }}></canvas>
  );
};

export default SpreadParticleImage;
