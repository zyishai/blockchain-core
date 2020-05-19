const Blockchain = require('../blockchain');
const WalletBase = require('./base');
const Transaction = require('../transaction');

class FullNodeWallet extends WalletBase {
    constructor(name, clear) {
        super(name);
        this.blockchain = new Blockchain(name, clear);
    }

    async printBlockchain() {
        console.clear();
        if (!this.blockchain.isChainValid()) {
            console.log('Block is not valid!');
            return;
        }
        this.blockchain.chain.get().forEach(block => {
            console.log('BLOCK HEADER')
            console.log(block.getHeader());
            if (!block.hasValidTransactions()) {
                console.log('Block has invalid transactions.');
            } else {
                console.log('TRANSACTIONS IN BLOCK');
                console.log(block.transactions);
            }
        });
    }

    async syncBlockchain() {
        this.broadcast('headers', this.blockchain.chain.get().map(block => block.getHeader()));
    }

    async printPendingTransactions() {
        console.clear();
        this.blockchain.pendingTransactions.forEach(tx => {
            if (!tx.isValid()) {
                console.log(`Transaction ${tx.hash} is not valid.`);
            } else {
                console.log(tx);
            }
        });
    }

    async minePendingTransactions() {
        const block = this.blockchain.minePendingTransactions(this.publicAddress);
        console.log(`${block.transactions.length} transactions mined successfully.`);
        console.log(`New block created: ${block.hash}`);
    }

    createTransaction({ payload }, done) {
        const tx = new Transaction();
        Object.assign(tx, payload);

        this.blockchain.addPendingTransaction(tx);

        if (done) {
            done(null, {
                message: 'Transaction created successfully.',
                hash: tx.hash
            });
        } else {
            console.log('Transaction created successfully.');
            console.log('Transaction hash:', tx.hash);
            return tx.hash;
        }
    }

    searchTransaction({ payload }, done) {
        const blocks = this.blockchain.chain.get()
            .filter(block => block.filter.has(Number.parseInt(payload, 16)))
        const transactions = blocks
            .map(block => block.transactions.find(tx => tx.hash === payload));

        if (done) {
            done(null, {
                data: transactions.length ? transactions : `No transactions found in blockchain with hash ${payload}.`
            });
        } else {
            // console.log(transactions.length ? transactions : `No transactions found in blockchain with hash ${payload}.`);

            return {
                block: blocks[0],
                transaction: transactions[0]
            }
        }
    }

    verifyTransaction({ payload }, done) {
        try {
            const { txHash, blockHash } = payload;

            if (done) {
                done(null, {
                    verified: this.blockchain.verifyTransaction(blockHash, txHash)
                });
            } else {
                // console.log('Is transaction verified?', this.blockchain.verifyTransaction(blockHash, txHash));
                return this.blockchain.verifyTransaction(blockHash, txHash);
            }
        } catch(err) {
            console.error(err);
            done(err);
        }
    }

    getBalanceFor({ payload }, done) {
        const balance = this.blockchain.getBalanceOfAddress(payload);

        if (balance && done) {
            done(null, {balance});
        } else {
            console.log(`Balance of address ${payload} is ${balance}`);
            return balance;
        }
    }
}

module.exports = FullNodeWallet;