
const { MerkleTree } = require('merkletreejs');
const Blockchain = require('../blockchain');
const WalletBase = require('./base');
const Transaction = require('../transaction');

class FullNodeWallet extends WalletBase {
    constructor(name) {
        super(name);
        super.initialize(this);
        this.blockchain = new Blockchain();

        process.stdin.on('data', data => {
            const message = data.toString();

            if (message.startsWith('chain')) {
                console.log(this.blockchain.chain.map(block => block.transactions));
            }else if (message.startsWith('sync')) {
                this.syncHeadersWithPeers();
            } else if (message.startsWith('mine')) {
                this.blockchain.minePendingTransactions(this.publicAddress);
                this.syncHeadersWithPeers();
            }
        });

        this.peer.handle.createTransaction = this.createTransaction.bind(this);
        this.peer.handle.balance = this.getBalanceFor.bind(this);
        this.peer.handle.searchTransaction = this.searchTransaction.bind(this);
        this.peer.handle.verifyTransaction = this.verifyTransaction.bind(this);
    }

    syncHeadersWithPeers() {
        this.broadcast('headers', this.blockchain.chain.map(block => block.getHeader()));
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
            const block = this.blockchain.chain.find(block => block.hash === blockHash);
            if (!block) {
                return done(new Error(`Could not find block ${blockHash}.`));
            }

            const merkleRoot = block.header.merkleRoot;
            const proof = block.tree.getProof(Buffer.from(txHash));

            return done(null, {
                verified: this.blockchain.verifyTransaction(merkleRoot, proof, Buffer.from(txHash))
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