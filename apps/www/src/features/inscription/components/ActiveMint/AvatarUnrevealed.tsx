import { renderCanvas, operations } from "@0xflick/ordinals-axolotl-valley-web";
import { FC, useEffect, useRef } from "react";

function randomUint8ArrayOfLength(length: number) {
  const arr = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    arr[i] = Math.floor(Math.random() * 256);
  }
  return arr;
}

export const AvatarUnrevealed: FC<{
  size?: "small";
  refreshInterval?: number;
  urlPrefix?: string;
}> = ({
  size = "small",
  refreshInterval = 5000,
  urlPrefix = "/axolotl-content/",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const width = size === "small" ? 64 : 128,
    height = width;
  useEffect(() => {
    const offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = 569;
    offscreenCanvas.height = 569;
    const render = async () => {
      const seedBytes: Uint8Array = randomUint8ArrayOfLength(32);
      const { layers } = await operations(seedBytes, async (imagePath) => {
        console.log(imagePath);
        const img = new Image();
        img.src = `${urlPrefix}${imagePath}`;
        return img;
      });
      if (!offscreenCanvas) {
        return;
      }
      await renderCanvas(offscreenCanvas, layers);
      if (!canvasRef.current) {
        return;
      }
      // copy the offscreen canvas to the visible canvas
      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) {
        return;
      }
      // scale to size
      ctx.drawImage(
        offscreenCanvas,
        0,
        0,
        offscreenCanvas.width,
        offscreenCanvas.height,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
    };
    let renderInterval = setInterval(render, refreshInterval);
    render();
    return () => {
      clearInterval(renderInterval);
    };
  }, [refreshInterval, urlPrefix]);

  return <canvas ref={canvasRef} width={width} height={height} />;
};
