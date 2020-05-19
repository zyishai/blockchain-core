const Block = require('./block');
const Transaction = require('./transaction');
const { Mempool, Ledger } = require('./utils/persistence');

class Blockchain {
  constructor(name, clear) {
    this.chain = new Ledger(name);
    if (clear) {
      this.chain.clear();
    }
    this.chain.addBlock(this.createGenesisBlock());
    this.difficulty = 1;
    /**
     * @type {Mempool}
     */
    this.pendingTransactions = new Mempool();
    this.minerReward = 100;
  }

  createGenesisBlock() {
    const block = new Block(new Date(2020, 3, 1), [], '0');

    return block;
  }

  getLatestBlock() {
    return this.chain.getLatestBlock();
  }

  minePendingTransactions(minerAddress) {
    const rewardTx = new Transaction(null, minerAddress, this.minerReward);
    this.pendingTransactions.addTransactionToHead(rewardTx);

    const block = new Block(Date.now(), this.pendingTransactions.getNoOfTransactions(4), this.getLatestBlock().hash);
    
    block.mineBlock(this.difficulty);
    
    this.chain.addBlock(block);

    return block;
  }

  addPendingTransaction(transaction) {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error('Transaction must include from and to address');
    }
    if (!transaction.isValid()) {
      throw new Error('Cannot add invalid transaction to chain');
    }

    this.pendingTransactions.addTransaction(transaction);
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
    const chain = this.chain.get();
    for (let i = 1; i < chain.length; i++) {
      const currentBlock = chain[i];
      const previousBlock = chain[i-1];
      
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

    const block = this.chain.getBlockByHash(blockHash);

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