const Block = require('./block');
const Transaction = require('./transaction');

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 1;
    this.pendingTransactions = [];
    this.minerReward = 99;
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
    this.addPendingTransaction(rewardTx);

    const block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
    
    block.mineBlock(this.difficulty);
    console.log('Block successfully mined');
    
    this.chain.push(block);
    this.pendingTransactions = [];
  }

  addPendingTransaction(transaction) {
    this.pendingTransactions.push(transaction);
  }

  getBalanceOfAddress(address) {
    let balance = 0;

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

module.exports = Blockchain;