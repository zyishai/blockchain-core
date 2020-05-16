const SPVWallet = require('./src/wallets/spv');

module.exports = new SPVWallet(process.argv[2]);