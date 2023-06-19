import type { Image } from "canvas";

const imageBufferCache = new Map<string, Image | HTMLImageElement>();

export interface IImageFetcher {
  (key: string): Promise<Image | HTMLImageElement>;
}

export async function getImage(
  imgPath: string,
  imageFetcher: IImageFetcher
): Promise<Image | HTMLImageElement> {
  if (imageBufferCache.has(imgPath)) {
    return imageBufferCache.get(imgPath) as Image;
  }
  const img = await imageFetcher(imgPath);
  imageBufferCache.set(imgPath, img);
  return img;
}
