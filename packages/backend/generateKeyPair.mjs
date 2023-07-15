import * as jose from 'jose';

const { publicKey, privateKey } = await jose.generateKeyPair('ECDH-ES+A128KW', {
  extractable: true,
  crv: 'P-521',
})
const JWK = await jose.exportJWK(privateKey);
const spkiPem = await jose.exportSPKI(publicKey);

console.log(`AUTH_MESSAGE_JWK=${JSON.stringify(JWK)}`);
console.log(`AUTH_MESSAGE_PUBLIC_KEY="${spkiPem.split('\n').join('\\n')}"`);
