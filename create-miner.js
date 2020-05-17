const p2p = require('p2p');
const FullNode = require('./src/wallets/full-node');
const createReader = require('./src/utils/reader');

const minerWallet = new FullNode(process.argv[2]);

const [myPort, ...peerPorts] = process.argv.slice(3);
const peer = p2p.peer({
    host: 'localhost',
    port: myPort,
    wellKnownPeers: peerPorts.map(port => ({ host: 'localhost', port }))
});
const reader = createReader();
peer.handle.headers = () => {};
peer.handle.createTransaction = minerWallet.createTransaction.bind(minerWallet);
peer.handle.searchTransaction = minerWallet.searchTransaction.bind(minerWallet);
peer.handle.verifyTransaction = minerWallet.verifyTransaction.bind(minerWallet);
peer.handle.balance = minerWallet.getBalanceFor.bind(minerWallet);
peer.handle.introduce = minerWallet.addNewPeer.bind(minerWallet);

minerWallet.setPeer(peer);
reader.start(minerWallet);