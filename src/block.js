const sha256 = require('crypto-js/sha256');

class Block {
  constructor(timestamp, transactions, previousHash = "") {
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    // const hash = crypto.createHash('sha256');
    // hash.update(`${this.previousHash}${this.timestamp}${JSON.stringify(this.transaction)}${this.nonce}`);
    // const base64Hash = hash.digest('base64');

    // return base64Hash;

    return sha256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
  }

  mineBlock(difficulty) {
    while (this.hash.slice(0, difficulty) !== '0'.repeat(difficulty)) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log('Block mined', this.hash);
  }
}

module.exports = Block;