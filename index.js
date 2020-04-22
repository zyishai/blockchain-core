const { Block, Blockchain } = require('./blockchain');

const yishaiCoin = new Blockchain();

yishaiCoin.addBlock(new Block(1, new Date(2020, 3, 1), {
    amount: 4
}));

yishaiCoin.addBlock(new Block(2, new Date(2020, 3, 1), {
    amount: 8
}));

console.log(JSON.stringify(yishaiCoin, null, 2));