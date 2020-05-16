const p2p = require('p2p');
const { generateKeys, ec } = require('../key-generator');
const Transaction = require('../transaction');

class BaseWallet {
    constructor(name) {
        const {
            privateKey,
            publicKey
        } = generateKeys();
        this.keyObj = ec.keyFromPrivate(privateKey);
        this.publicAddress = this.keyObj.getPublic('hex');
        this.name = name;
    }

    initialize(wallet) {
        const [myPort, ...peerPorts] = process.argv.slice(3);
        this.peer = p2p.peer({
            host: 'localhost',
            port: myPort,
            wellKnownPeers: peerPorts.map(port => ({ host: 'localhost', port })),
            metadata: {
                name: this.name,
                address: this.publicAddress
            }
        });
        this.peer.handle.headers = () => {};
        this.peer.handle.createTransaction = () => {};
        this.peer.handle.balance = () => {};
        this.peer.handle.searchTransaction = () => {};
        this.peer.handle.verifyTransaction = () => {};
        console.log('my address:', this.publicAddress);

        process.stdin.on('data', data => {
            const message = data.toString();

            if (message.startsWith('send')) {
                const words = message.split(' ');
                const amount = words[1];
                const toAddress = words[words.indexOf('to') + 1];
                const tx = new Transaction(this.publicAddress, toAddress.trim(), Number.parseInt(amount));
                tx.signTransaction(this.keyObj);
                this.broadcast('createTransaction', tx, (err, result) => {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log(result.message);
                        console.log('Transaction hash:', result.hash);
                    }
                });
            } else if (message.startsWith('balance')) {
                this.broadcast('balance', this.publicAddress, (err, data) => {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log(`Balance for ${this.publicAddress} is ${data.balance} coins.`);
                    }
                });
            } else if (message.startsWith('search')) {
                const tokens = message.split(' ');
                const txHash = tokens[tokens.indexOf('transaction') + 1];
                this.broadcast('searchTransaction', txHash.trim(), (err, result) => {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log(result.data);
                    }
                });
            } else if (message.startsWith('verify')) {
                const tokens = message.split(' ');
                const txHash = tokens[1].trim();
                const blockHash = tokens[tokens.indexOf('block') + 1].trim();
                this.broadcast('verifyTransaction', { txHash, blockHash }, (err, result) => {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log(result.verified ? 'Transaction verified!' : 'Transaction could NOT be verified..');
                    }
                });
            }
        })
    }

    broadcast(event, data, callback = () => {}) {
        const peers = this.peer.wellKnownPeers.get().map(peer =>
            peer !== this.peer ? this.peer.remote(peer) : peer);

        peers.forEach(peer => peer.run(`handle/${event}`, {
            payload: data
        }, callback));
    }
}

module.exports = BaseWallet;