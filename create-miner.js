const FullNode = require('./src/wallets/full-node');

module.exports = new FullNode(process.argv[2]);