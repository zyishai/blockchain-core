const MinerWallet = require('./src/wallets/full-node');
const UserWallet = require('./src/wallets/spv');

const yishaiCoin = new MinerWallet();
const userA = new UserWallet(yishaiCoin.getBlockHeaders());
const userB = new UserWallet(yishaiCoin.getBlockHeaders());

function executeTransaction(from, to, amount) {
    const tx = from.createTransaction(to.publicAddress, amount);
    yishaiCoin.addTransaction(tx);
    console.log(`${from.publicAddress.slice(0, 6)} sent ${amount} coins to ${to.publicAddress.slice(0, 6)}.`);
}

// 18 transactions.
// only 16 transactions should be mined (2 other in mempool).
// every wallet has starting balance of 1000 coins.
// miner reward = 100 coins.
// total balance should be 3400.

// 1st transaction
executeTransaction(userA, userB, 130);
// 2nd transaction
executeTransaction(userB, yishaiCoin, 95);
// 3rd transaction
executeTransaction(userA, yishaiCoin, 54);
// 4th transaction
executeTransaction(yishaiCoin, userA, 200);
// 5th transaction
executeTransaction(yishaiCoin, userB, 31);
// 6th transaction
executeTransaction(userA, yishaiCoin, 500);
// 7th transaction
executeTransaction(userB, yishaiCoin, 450);
// 8th transaction
executeTransaction(userA, userB, 310);
// 9th transaction
executeTransaction(userB, userA, 70);
// 10th transaction
executeTransaction(yishaiCoin, userB, 490);
// 11th transaction
executeTransaction(userA, yishaiCoin, 240);
// 12th transaction
executeTransaction(userB, userA, 100);
// 13th transaction
executeTransaction(userB, yishaiCoin, 150);
// 14th transaction
executeTransaction(userB, userA, 305);
// 15th transaction
executeTransaction(yishaiCoin, userA, 260);
// 16th transaction
executeTransaction(yishaiCoin, userB, 270);
// 17th transaction
executeTransaction(yishaiCoin, userA, 270);
// 18th transaction
executeTransaction(userA, yishaiCoin, 250);

yishaiCoin.mineTransactions();
yishaiCoin.mineTransactions();
yishaiCoin.mineTransactions();
yishaiCoin.mineTransactions();
console.log('\n');

const userABalance = yishaiCoin.calculateBalanceForAddress(userA.publicAddress)
console.log('UserA balance:', userABalance);
const userBBalance = yishaiCoin.calculateBalanceForAddress(userB.publicAddress);
console.log('UserB balance:', userBBalance);
const minerBalance = yishaiCoin.calculateBalanceForAddress(yishaiCoin.publicAddress);
console.log('Miner balance:', minerBalance);
console.log('------------------------')
console.log('Total balance:', userABalance+userBBalance+minerBalance);
console.log('\n');

console.log('Verifying valid transaction...');
const block = yishaiCoin.blockchain.chain[2];
const transactionToVerify = block.transactions[2];
console.log('Verified transaction:', JSON.stringify(transactionToVerify, null, 2));
console.log('Merkle root:', block.header.merkleRoot);
console.log('Proof:', block.tree.getProof(transactionToVerify.hash));
console.log('Leaf:', transactionToVerify.hash);
const isVerified = yishaiCoin.verifyTransaction(
    block.header.merkleRoot,
    block.tree.getProof(Buffer.from(transactionToVerify.hash)),
    Buffer.from(transactionToVerify.hash)
);
console.log('Is transaction verified?', isVerified);
console.log('---------------------------\n');

console.log('Checking existence of not-yet-mined transaction...');
const transactionToCheck = yishaiCoin.blockchain.pendingTransactions[0];
console.log('Transaction to check:', JSON.stringify(transactionToCheck, null, 2));
console.log('Does exist on the blockchain?', !!yishaiCoin.findTransaction(transactionToCheck.hash));

// yishaiCoin.prettyPrint();