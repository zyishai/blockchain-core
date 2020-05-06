const EC = require('elliptic').ec;

const generator = new EC('secp256k1');

module.exports.ec = generator;
module.exports.generateKeys = function() {
    const keys = generator.genKeyPair();

    const publicKey = keys.getPublic('hex');
    const privateKey = keys.getPrivate('hex');

    return {
        publicKey,
        privateKey
    }
}