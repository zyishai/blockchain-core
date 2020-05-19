const low = require('lowdb');
const path = require('path');
const FileSync = require('lowdb/adapters/FileSync');
const Transaction = require('../transaction');
const Block = require('../block');
const serializer = require('node-serialize');

class Mempool {
    constructor() {
        const adapter = new FileSync(path.resolve(__dirname, '..', 'data', 'mempool.json'), {
            defaultValue: {
                /**
                 * @type {Transaction[]}
                 */
                transactions: []
            },
            serialize: data => serializer.serialize(data),
            deserialize: str => serializer.unserialize(str)
        });
        this.db = low(adapter);
    }

    addTransaction(tx) {
        this.db
            .get('transactions')
            .push(tx)
            .write();
    }

    addTransactionToHead(tx) {
        if (!this.db.get('transactions').has(tx).value()) {
            this.db
                .get('transactions')
                .unshift(tx)
                .write();
        }
    }

    getNoOfTransactions(noOfTransactions) {
        const transactions = this.db.get('transactions').slice(0, noOfTransactions).value();
        this.db
            .get('transactions')
            .remove((_, i) => i < noOfTransactions)
            .write();

        return transactions;
    }

    clear() {
        this.db.set('transactions', []).write();
    }
}

class Ledger {
    constructor(name) {
        const adapter = new FileSync(path.resolve(__dirname, '..', 'data', `ledger-${name}.json`), {
            defaultValue: {
                /**
                 * @type {Block[]}
                 */
                blocks: []
            },
            serialize: data => serializer.serialize(data),
            deserialize: str => serializer.unserialize(str)
        });
        this.db = low(adapter);
    }

    addBlock(block) {
        this.db
            .get('blocks')
            .push(block)
            .write();
    }

    getLatestBlock() {
        const blocks = this.get();
        
        return blocks[blocks.length - 1];
    }

    getBlockByHash(blockHash) {
        return this.db
            .get('blocks')
            .find(block => block.hash === blockHash)
            .value();
    }

    *[Symbol.iterator]() {
        for (let tx of this.db.get('blocks').value()) {
            yield tx;
        }
    }

    get() {
        return this.db.get('blocks').value();
    }

    clear() {
        this.db.set('blocks', []).write();
    }
}

module.exports.Mempool = Mempool;
module.exports.Ledger = Ledger;