const { Block, Blockchain } = require('./blockchain');

const yishaiCoin = new Blockchain();

yishaiCoin.addBlock(new Block(1, '1/3/2020', {
    amount: 4
}));

yishaiCoin.addBlock(new Block(2, '1/3/2020', {
    amount: 8
}));

console.log('Blockchain valid?', yishaiCoin.isChainValid());

console.log('------------------');


// console.log(JSON.stringify(yishaiCoin, null, 2));