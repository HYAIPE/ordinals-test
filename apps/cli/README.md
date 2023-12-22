# @0xflick/ordinals-cli

CLI application for working with Ordinals

```
yarn cli --help
```

## Ordinal Axolotl creation notes:

### testnet

Uploading all layers:

```
yarn cli bulk-mint -n testnet -o av-testnet.json {bc1p....address} '../../ordinals/axolotl-valley/web/content/**/*.webp'
```

This takes a while. Send funds to the requested address and wait. At the end you get a av-testnet.json that maps all file paths to ordinal IDs.

The file was copied and turned into [ordinals/axolotl-valley/src/inscriptions/testnet.ts](../../ordinals/axolotl-valley/src/inscriptions/testnet.ts)

Creating the javascript:

```
yarn cli axolotl-valley script --network regtest script.js
```

Inscribe the javascript:

```
yarn cli mint -a {bc1p....address} -n regtest -m text/javascript --fee-rate 14 script.js
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

with the backend running, create the collection:

```
yarn cli collection create -s 11155111 -m 'config={"testnet": { "scriptName": "/content/895a395c34147e77033a0c5812d441a7e0946638abb168f78ccfd2e440da175i0", "revealBlockDelta": 2 }' axolotl-valley 1000
```

do a test mint:

```
yarn cli test mint-one --claiming-address 0xf11cc36Cc9e0F2925a3660D5E4dC6bb232CF2A57 --rpcuser user --rpcpassword password --script-name e9143b17a26c7dc4e62480976152cb4826744feade4eeca0d783cbc3edf019dei0
```
