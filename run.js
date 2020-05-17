const MinerWallet = require('./src/wallets/full-node');
const SPVWallet = require('./src/wallets/spv');
const Transaction = require('./src/transaction');

const miner = new MinerWallet('yishai');
const user = new SPVWallet('someone');

// creating a transaction.
const tx = new Transaction(
    user.publicAddress, 
    miner.publicAddress, 
    500);
tx.signTransaction(user.keyObj); // singing the tx.
miner.createTransaction({ payload: tx });

// mining.
miner.minePendingTransactions();

// verification
const { transaction, block } = miner.searchTransaction({
    payload: tx.hash
});
const isVerified = miner.verifyTransaction({
    payload: {
        txHash: transaction.hash,
        blockHash: block.hash
    }
});

console.log('Is transaction verified?', isVerified);