# @0xflick/assets

A utilities for generating image assets from individual layers

## Theory

Images are drawn with a series of canvas operations defined as:

```
interface ILayer {
  draw(ctx: CanvasRenderingContext2D): Promise<void>;
  zIndex: number;
}
```

`draw` is a function that accepts a canvas 2d context and resolves with a void promise when it is done drawing
`zIndex` is used to sort the draw operations before they are applies

Some useful [filters](./src/canvas/filters.ts) are provided in order to do useful things like chroma keying or applying various filters

Some [utils](./src/canvas/utils.ts) are also provided to help with sampling for creating weighted randomization sets
