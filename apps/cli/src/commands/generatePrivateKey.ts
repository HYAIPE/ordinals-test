import { generatePrivKey } from "@0xflick/inscriptions"

export function generatePrivateKey() {
  const privKey = generatePrivKey()
  console.log(privKey)
}
