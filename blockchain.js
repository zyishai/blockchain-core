const sha256 = require('crypto-js/sha256');

class Block {
  constructor(index, timestamp, data, previousHash = "") {
    this.index = index;
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.data = data;
    this.hash = '';
  }

  calculateHash() {
    // const hash = crypto.createHash('sha256');
    // hash.update(`${this.index}${this.previousHash}${this.timestamp}${JSON.stringify(this.data)}`);
    // // hash.update(this.index + this.previousHash + this.nonce + this.timestamp + JSON.stringify(this.data));
    // const base64Hash = hash.digest('base64');

    // return base64Hash;

    return sha256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data)).toString();
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
  }

  createGenesisBlock() {
    const block = new Block(0, new Date(2020, 3, 1), 'Genesis Block', '0');
    block.hash = block.calculateHash();

    return block;
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.hash = newBlock.calculateHash();

    this.chain.push(newBlock);
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i-1];
      
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.calculateHash()) {
        return false;
      }
    }

    return true;
  }
}

module.exports = {
  Blockchain,
  Block
}
