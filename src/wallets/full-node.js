const Blockchain = require('../blockchain');
const WalletBase = require('./base');
const Transaction = require('../transaction');

class FullNodeWallet extends WalletBase {
    constructor(name) {
        super(name);
        super.initialize(this);
        this.blockchain = new Blockchain();

        this.peer.handle.createTransaction = this.createTransaction.bind(this);
        this.peer.handle.searchTransaction = this.searchTransaction.bind(this);
        this.peer.handle.verifyTransaction = this.verifyTransaction.bind(this);
        this.peer.handle.balance = this.getBalanceFor.bind(this);
    }

    async printBlockchain() {
        console.clear();
        if (!this.blockchain.isChainValid()) {
            console.log('Block is not valid!');
            return;
        }
        this.blockchain.chain.forEach(block => {
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
        this.broadcast('headers', this.blockchain.chain.map(block => block.getHeader()));
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
        done(null, {
            message: 'Transaction created successfully.',
            hash: tx.hash
        });
    }

    searchTransaction({ payload }, done) {
        const transactions = this.blockchain.chain
            .filter(block => block.filter.has(Number.parseInt(payload, 16)))
            .map(block => block.transactions.find(tx => tx.hash === payload));

        done(null, {
            data: transactions.length ? transactions : `No transactions found in blockchain with hash ${payload}.`
        });
    }

    verifyTransaction({ payload }, done) {
        try {
            const { txHash, blockHash } = payload;

            done(null, {
                verified: this.blockchain.verifyTransaction(blockHash, txHash)
            });
        } catch(err) {
            console.error(err);
            done(err);
        }
    }

    getBalanceFor({ payload }, done) {
        const balance = this.blockchain.getBalanceOfAddress(payload);
        done(null, {balance});
    }
}

module.exports = FullNodeWallet;