const EC = require('elliptic').ec;

const generator = new EC('secp256k1');

const keys = generator.genKeyPair();

const publicKey = keys.getPublic('hex');
const privateKey = keys.getPrivate('hex');

console.log('Our public address:', publicKey);
console.log('Our private address:', privateKey);