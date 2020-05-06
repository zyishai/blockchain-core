const sha256 = require('crypto-js/sha256');
const ec = require('./key-generator').ec;

class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.timestamp = Date.now();
    }

    calculateHash() {
        return sha256(
            this.fromAddress + 
            this.toAddress + 
            this.amount + 
            this.timestamp
        ).toString();
    }

    signTransaction(signingKey) {
        if (this.fromAddress !== signingKey.getPublic('hex')) {
            throw new Error('You cannot sign transaction for other wallets');
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }

    isValid() {
        if (!this.fromAddress) {
            return true;
        }
        if (!this.signature.trim()) {
            throw new Error('No signature in this transaction');
        }
        
        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

module.exports = Transaction;