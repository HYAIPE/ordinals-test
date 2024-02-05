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

#### creating a parent-child inscription

First create a pay to public taproot address to hold the parent inscription

```
yarn cli receive --network regtest
```

This will output a seckey and address. Save the seckey and send (or inscribe) the parent inscription to the taproot address

```
privKey: cb6db92d4061d6417ae8a526d4c7ce9b66c8851a6cdd563f1ef933c260c3b7be
address: bcrt1p7c7fr62mm4y89zuf8gax93g93942fyfer4flhujmxlvev7fxmvaqmw2fnc
```

Take note of the inscription id and spendable txid of the parent inscription.

Now, create the child inscription.

```
yarn cli mint -a bcrt1p27zmlt3ldvzxpf833nvgg8x8rp55cegankn4elr4dje8ehm2nuvsxk6vhc -n regtest -m image/png --fee-rate 2 --rpcwallet default --parent-inscription 5c4c789025507dbea4d2f26d8121ec2926fc468313eb5f9684e2b99a852050eai0 --parent-txid 745d853eca3c35e14850f823b13399fdb52503fcd9bca9568db3d538717f7588 --parent-index 0 --parent-key 6c219403b9c0a221e37de414476c334e65ef9fda65b13123dfed51a39d648226 --padding 546 ~/Pictures/flick.png
```

the console logs will include a new address and seckey for the parent inscription. Take note of the new seckey and txid because it is needed in order to send the parent inscription again. In order to do a new parent-child inscription you will need to update the parent-txid and parent-seckey
