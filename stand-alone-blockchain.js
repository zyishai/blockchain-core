require('dotenv').config();
const Blockchain = require('./src/blockchain');
const Transaction = require('./src/transaction');
const ec = require('./src/key-generator').ec;
const { MerkleTree } = require('merkletreejs');

const myKey = ec.keyFromPrivate(process.env.PRIVATE_KEY);
const myWalletAddress = myKey.getPublic('hex');

const yishaiCoin = new Blockchain();

const tx1 = new Transaction(myWalletAddress, 'address2', 10);
tx1.signTransaction(myKey);
yishaiCoin.addPendingTransaction(tx1);

const tx2 = new Transaction(myWalletAddress, 'address1', 50);
tx2.signTransaction(myKey);
yishaiCoin.addPendingTransaction(tx2);

console.log('Mining.......');

yishaiCoin.minePendingTransactions(myWalletAddress);

console.log('-------------------');

console.log('Balance:', yishaiCoin.getBalanceOfAddress(myWalletAddress));

// console.log(JSON.stringify(yishaiCoin, null, 2));

// MerkleTree.print(yishaiCoin.chain[1].tree);
// console.log(yishaiCoin.chain[1].filter);
// console.log('Filter value(binary):', yishaiCoin.chain[1].filter.filter.toString(2));