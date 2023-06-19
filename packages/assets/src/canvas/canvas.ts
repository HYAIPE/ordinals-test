export async function createCanvas(width: number, height: number) {
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }
  const Canvas = await import("canvas");
  return new Canvas.Canvas(width, height);
}
