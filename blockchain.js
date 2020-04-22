const crypto = require('crypto');

class Block {
  constructor(index, timestamp, data, previousHash = "") {
    this.index = index;
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.data = data;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    const hash = crypto.createHash('sha256');
    hash.update(`${this.index}${this.previousHash}${this.nonce}${this.timestamp}${JSON.stringify(this.data)}`);
    // hash.update(this.index + this.previousHash + this.nonce + this.timestamp + JSON.stringify(this.data));
    const base64Hash = hash.digest('base64');

    return base64Hash;
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
  }

  createGenesisBlock() {
    return new Block(0, new Date(2020, 3, 1), 'Genesis Block', '0');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;

    this.chain.push(newBlock);
  }
}

module.exports = {
  Blockchain,
  Block
}
