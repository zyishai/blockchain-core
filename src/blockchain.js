const Block = require('./block');
const Transaction = require('./transaction');

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 1;
    this.pendingTransactions = []; // also known as `mempool`!
    this.minerReward = 100;
  }

  createGenesisBlock() {
    const block = new Block(new Date(2020, 3, 1), [], '0');

    return block;
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  minePendingTransactions(minerAddress) {
    const rewardTx = new Transaction(null, minerAddress, this.minerReward);
    this.pendingTransactions.unshift(rewardTx);

    const block = new Block(Date.now(), this.pendingTransactions.slice(0, 4), this.getLatestBlock().hash);
    
    block.mineBlock(this.difficulty);
    console.log('Block successfully mined');
    
    this.chain.push(block);
    this.pendingTransactions = this.pendingTransactions.slice(4);
  }

  addPendingTransaction(transaction) {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error('Transaction must include from and to address');
    }
    if (!transaction.isValid()) {
      throw new Error('Cannot add invalid transaction to chain');
    }

    this.pendingTransactions.push(transaction);
  }

  getBalanceOfAddress(address) {
    let balance = 1000;

    for (let block of this.chain) {
      for (let tx of block.transactions) {
        if (tx.fromAddress === address) {
          balance -= tx.amount;
        } else if (tx.toAddress === address) {
          balance += tx.amount;
        }
      }
    }

    return balance;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i-1];
      
      if (!currentBlock.hasValidTransactions()) {
        return false;
      }

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.calculateHash()) {
        return false;
      }
    }

    return true;
  }

  /**
   * Verify that a transaction exists in a block.
   * 
   * @param {String} merkleRoot hex representation of the merkle tree's root
   * @param {any} proof 
   * @param {String} leaf hash of leaf
   */
  verifyTransaction(merkleRoot, proof, leaf) {
    const block = this.chain.find(block => block.tree.getRoot().toString('hex') === merkleRoot);

    if (!block) {
      return false;
    }

    return block.tree.verify(proof, leaf, block.tree.getRoot());
  }
}

module.exports = Blockchain;