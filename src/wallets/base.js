const p2p = require('p2p');
const { generateKeys, ec } = require('../key-generator');
const Transaction = require('../transaction');

class BaseWallet {
    constructor(name) {
        const {
            privateKey
        } = generateKeys();
        this.keyObj = ec.keyFromPrivate(privateKey);
        this.publicAddress = this.keyObj.getPublic('hex');
        this.name = name;
        this.wallets = {
            [this.name]: this.publicAddress
        }
    }

    async introduce() {
        console.clear();
        console.log(`Wallet name: ${this.name}`);
        console.log(`Wallet address: ${this.publicAddress}`);
        this.broadcast('introduce', { name: this.name, address: this.publicAddress }, (err, peer) => {
            if (err) {
                console.error(err);
            } else {
                this.wallets[peer.name] = peer.address;
            }
        });
    }

    async printBlockchain() {
        console.clear();
        console.log('You cannot print the blockchain from a SPV wallet.')
    }

    async syncBlockchain() {
        console.clear();
        console.log('You cannot sync the blockchain from a SPV wallet.');
    }

    async printPendingTransactions() {
        console.clear();
        console.log('You cannot print pending transactions from a SPV wallet.');
    }

    async minePendingTransactions() {
        console.clear();
        console.log('You cannot mine pending transactions from a SPV wallet.');
    }

    async makeTransfer(walletName, amount) {
        const toAddress = this.wallets[walletName];
        console.log('public address:', this.publicAddress);
        console.log('to address', toAddress);
        console.log('wallet name', walletName);
        const tx = new Transaction(this.publicAddress, toAddress, Number.parseInt(amount));
        tx.signTransaction(this.keyObj);

        return new Promise(resolve => {
            this.broadcast('createTransaction', tx, (err, result) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log(result.message);
                    console.log('Transaction hash:', result.hash);
                }
            });
            resolve();
        });
    }

    async emitSearchTransaction(txHash) {
        return new Promise(resolve => {
            this.broadcast('searchTransaction', txHash, (err, result) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log(result.data);
                }
            });
            resolve();
        });
    }

    async emitVerifyTransaction(blockHash, txHash) {
        return new Promise(resolve => {
            this.broadcast('verifyTransaction', { txHash, blockHash }, (err, result) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log(result.verified ? 'Transaction verified!' : 'Transaction could NOT be verified..');
                }
                resolve();
            });
        });
    }

    async displayInfo() {
        await this.introduce();
        return new Promise(resolve => {
            this.broadcast('balance', this.publicAddress, (err, data) => {
                if (err) {
                    console.log('Could not calculate balance:');
                    console.error(err);
                } else {
                    console.log(`Wallet balance: ${data.balance} coins.`);
                }

                resolve();
            });
        });
    }

    setPeer(peer) {
        this.peer = peer;
    }

    broadcast(event, data, callback = () => {}) {
        const peers = this.peer.wellKnownPeers.get().map(peer =>
            peer !== this.peer ? this.peer.remote(peer) : peer);

        peers.forEach(peer => peer.run(`handle/${event}`, {
            payload: data
        }, callback));
    }

    addNewPeer({ payload }, done) {
        const isKnownPeer = !!this.wallets[payload.name];
        this.wallets[payload.name] = payload.address;

        if (!isKnownPeer) {
            done(null, { name: this.name, address: this.publicAddress });
        }
    }
}

module.exports = BaseWallet;