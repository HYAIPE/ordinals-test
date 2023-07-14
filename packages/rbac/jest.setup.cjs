
const jose = require('jose');

async function doIt() {
  const { publicKey, privateKey } = await jose.generateKeyPair('ECDH-ES+A128KW', {
    extractable: true,
    crv: 'P-521',
  })
  const pkcs8Pem = await jose.exportPKCS8(privateKey);
  const spkiPem = await jose.exportSPKI(publicKey);
  const JWK = await jose.exportJWK(privateKey);

  process.env.JWT_PRIVATE_KEY = pkcs8Pem;
  process.env.NEXT_PUBLIC_JWT_PUBLIC_KEY = spkiPem;
  process.env.JWK = JSON.stringify(JWK);
}

global.promisePrivateKeys = doIt().catch(console.error);
