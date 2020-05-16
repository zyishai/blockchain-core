const sha256 = require('crypto-js/sha256');
const { MerkleTree } = require('merkletreejs');
const BloomFilter = require('./utils/bloom-filter');
const BlockHeader = require('./block-header');
const Transaction = require('./transaction');

class Block {
  /**
   * Block constructor.
   * 
   * @param {String} timestamp 
   * @param {Transaction[]} transactions 
   * @param {String} previousHash 
   */
  constructor(timestamp, transactions, previousHash = "") {
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.nonce = 0;
    this.hash = this.calculateHash();
    
    this.filter = this.initializeBloomFilter();
    this.tree = new MerkleTree(
      this.transactions.map(tx => Buffer.from(tx.hash)),
      sha256
    );
    this.header = new BlockHeader(
      this.hash,
      this.previousHash,
      this.timestamp,
      this.nonce,
      this.tree.getRoot().toString('hex')
    );
  }

  getHeader() {
    return this.header;
  }

  calculateHash() {
    return sha256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
  }

  initializeBloomFilter() {
    const filter = new BloomFilter();
    this.transactions.forEach(tx => {
      filter.add(Number.parseInt(tx.hash, 16));
    });

    return filter;
  }

  mineBlock(difficulty) {
    while (this.hash.slice(0, difficulty) !== '0'.repeat(difficulty)) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    this.header.hash = this.hash;
    console.log('Block mined', this.hash);
  }

  hasValidTransactions() {
    for (let tx of this.transactions) {
      if (!tx.isValid()) {
        return false;
      }
    }

    return true;
  }
}

module.exports = Block;