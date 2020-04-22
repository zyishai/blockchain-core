const Blockchain = require('./src/blockchain');
const Transaction = require('./src/transaction');

const yishaiCoin = new Blockchain();

yishaiCoin.addPendingTransaction(
    new Transaction('address1', 'address2', 100)
);
yishaiCoin.addPendingTransaction(
    new Transaction('address2', 'address1', 50)
);

console.log('-------------------');

yishaiCoin.minePendingTransactions('yishai');
console.log(yishaiCoin.getBalanceOfAddress('yishai'));

// console.log(JSON.stringify(yishaiCoin, null, 2));