const imageBufferCache = new Map<string, typeof Image | HTMLImageElement>();

export interface IImageFetcher {
  (key: string): Promise<typeof Image | HTMLImageElement>;
}

export async function getImage(
  imgPath: string,
  imageFetcher: IImageFetcher,
): Promise<typeof Image | HTMLImageElement> {
  if (imageBufferCache.has(imgPath)) {
    return imageBufferCache.get(imgPath)!;
  }
  const img = await imageFetcher(imgPath);
  imageBufferCache.set(imgPath, img);
  return img;
}
