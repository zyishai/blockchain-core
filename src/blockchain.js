const Block = require('./block');
const Transaction = require('./transaction');

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 1;
    /**
     * @type {Transaction[]}
     */
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
    
    this.chain.push(block);
    this.pendingTransactions = this.pendingTransactions.slice(4);

    return block;
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
   * merkleRoot, proof, leaf
   */
  verifyTransaction(blockHash, transactionHash) {
    if (!blockHash || !transactionHash) {
      console.log('missing block/transaction hash');
      return false;
    }

    const block = this.chain.find(block => block.hash === blockHash);

    if (!block) {
      console.log('could not find block with hash', blockHash, '.');
      return false;
    }

    const leaf = Buffer.from(transactionHash);
    const proof = block.tree.getProof(leaf);
    const root = block.header.merkleRoot;

    return block.tree.verify(proof, leaf, root);
  }
}

module.exports = Blockchain;