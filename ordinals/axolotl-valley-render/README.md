# @0xflick/ordinals-axolotl-valley

Generation code for Axolotl Valley

I'm pretty happy with how this turned out, feel free to browse [src](./src/)

## Inscription mappings

Inscription mappings are generated when minting layer files into ordinals and placed into [src/inscriptions](./src/inscriptions/) matching the network name

When building, the mapping matching the network is used.

### local

```
yarn build:ordinal:local
```

```
npx static-server web
```
