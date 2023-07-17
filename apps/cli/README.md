# @0xflick/ordinals-cli

CLI application for working with Ordinals

```
yarn cli --help
```

## Ordinal Axolotl creation notes:

### testnet

Uploading all layers:

```
yarn cli bulk-mint -n testnet -o av-testnet.json {bc1p....address} '../../packages/assets/web/properties/**/*.webp'
```

This takes a while. Send funds to the requested address and wait. At the end you get a av-testnet.json that maps all file paths to ordinal IDs.

The file was copied and turned into [ordinals/axolotl-valley/src/inscriptions/testnet.ts](../../ordinals/axolotl-valley/src/inscriptions/testnet.ts)

Creating the javascript:

```
 yarn cli axolotl-valley script --network testnet script.js
```

Inscribe the javascript:

```
yarn cli mint -a {bc1p....address} -n mainnet -m text/javascript --fee-rate 14 script.js
```

You'll get an reveal tx. Add `i0` to get the ordinal id

Now create the HTML for a token (in this case a genesis token with id 1 and reveal block 795108):

```
yarn cli axolotl-valley html -s "/content/{inscription_id}i0" -t 1 --genesis -r 795108 index.html
```

Finally inscribe the html:

```
yarn cli mint -a {bc1p....address} -n testnet -m text/html;charset=utf-8 --fee-rate 14 index.html
```
