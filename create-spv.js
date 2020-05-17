const p2p = require('p2p');
const SPVWallet = require('./src/wallets/spv');
const createReader = require('./src/utils/reader');

const spvWallet = new SPVWallet(process.argv[2]);

const [myPort, ...peerPorts] = process.argv.slice(3);
const peer = p2p.peer({
    host: 'localhost',
    port: myPort,
    wellKnownPeers: peerPorts.map(port => ({ host: 'localhost', port }))
});
const reader = createReader();
peer.handle.headers = spvWallet.getBlockHeaders.bind(spvWallet);
peer.handle.createTransaction = () => {};
peer.handle.searchTransaction = () => {};
peer.handle.verifyTransaction = () => {};
peer.handle.balance = () => {};
peer.handle.introduce = spvWallet.addNewPeer.bind(spvWallet);

spvWallet.setPeer(peer);
reader.start(spvWallet);