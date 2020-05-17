const readline = require('readline');
const MinerWallet = require('./src/wallets/full-node');
const SPVWallet = require('./src/wallets/spv');
const Transaction = require('./src/transaction');

const rl = readline.createInterface(process.stdin, process.stdout);
const yishai = new MinerWallet('yishai');
const personA = new SPVWallet('a');
const personB = new SPVWallet('b');

// utility helpers
function makeTransfer(fromWallet, toWallet, amount) {
    console.log(`Creating transfer of ${amount} coins from ${fromWallet.name} to ${toWallet.name}.`);
    const tx = new Transaction(
        fromWallet.publicAddress, 
        toWallet.publicAddress, 
        amount);
    tx.signTransaction(fromWallet.keyObj);
    return yishai.createTransaction({ payload: tx });
}
async function question(msg) {
    return new Promise(resolve => {
        rl.question(msg, resolve);
    });
}

async function nextStep() {
    console.log();
    await question('Press ENTER to continue..');
    console.clear();
}

(async () => {
    console.log('~~~ Welcome to YishaiCoin Blockchain Demo! ~~~');
    console.log();
    console.log('This demo will demonstrate a p2p network of 3 peers where one of theme (yishai) is also a miner.');
    console.log('Let\'s start!');
    await nextStep();

    // create 18 transactions
    console.log('We will start by creating 18 transactions..');
    await nextStep();
    makeTransfer(personA, personB, 500); //1
    await nextStep();
    makeTransfer(personA, yishai, 50); //2
    await nextStep();
    makeTransfer(personB, personA, 120); //3
    await nextStep();
    makeTransfer(personB, yishai, 300); //4
    await nextStep();
    makeTransfer(yishai, personA, 290); //5
    await nextStep();
    const minedTransactionHash = makeTransfer(personA, personB, 80); //6
    await nextStep();
    makeTransfer(personB, personA, 370); //7
    await nextStep();
    makeTransfer(yishai, personB, 15); //8
    await nextStep();
    makeTransfer(personB, personA, 38); //9
    await nextStep();
    makeTransfer(personB, yishai, 100); //10
    await nextStep();
    makeTransfer(yishai, personA, 80); //11
    await nextStep();
    makeTransfer(personA, personB, 57); //12
    await nextStep();
    makeTransfer(personA, yishai, 25); //13
    await nextStep();
    makeTransfer(yishai, personB, 100); //14
    await nextStep();

    // this transactions WON'T be mined
    makeTransfer(personA, personB, 100); //15
    await nextStep();
    const pendingTransactionHash = makeTransfer(personB, yishai, 20); //16
    await nextStep();
    makeTransfer(personB, personA, 110); //17
    await nextStep();
    makeTransfer(personA, personB, 12); //18
    await nextStep();

    // mine 16 transactions
    console.log('Now we will mine 16 transactions.');
    await nextStep();
    yishai.minePendingTransactions();
    await nextStep();
    yishai.minePendingTransactions();
    await nextStep();
    yishai.minePendingTransactions();
    await nextStep();
    yishai.minePendingTransactions();
    await nextStep();

    // search for existing transaction
    console.log('Now, we will search for a transaction.');
    console.log('Transaction Hash:', minedTransactionHash);
    console.log('This will use the Bloom Filter to search quickly for the transaction in each block.');
    await nextStep();
    const { block, transaction } = yishai.searchTransaction({ payload: minedTransactionHash });
    console.log(`Found transaction!\n${JSON.stringify(transaction, null, 2)}`);
    await nextStep();

    // verify existing transaction
    console.log('Now we will try to verify the transaction in the block.');
    console.log(`Transaction hash: ${transaction.hash}`);
    console.log(`Block hash: ${block.hash}`);
    console.log('This will use the Merkle tree to verify the transaction authenticity and validity.');
    await nextStep();
    const isVerified = yishai.verifyTransaction({
        payload: {
            txHash: transaction.hash,
            blockHash: block.hash
        }
    });
    console.log(isVerified ? 'Transaction verified!' : 'Transaction did not verified..');
    await nextStep();

    // search for not mined transaction
    console.log('Now we will try to search for a pending transaction and see what we will get..');
    await nextStep();
    const result = yishai.searchTransaction({ payload: pendingTransactionHash });
    console.log(`Got ${result.transaction}.`);
    await nextStep();

    // get total balance
    console.log('Now let\'s calculate the total balance.');
    await nextStep();
    const personABalance = yishai.getBalanceFor({ payload: personA.publicAddress });
    console.log(`Balance for person A: ${personABalance}`);
    await nextStep();
    const personBBalance = yishai.getBalanceFor({ payload: personB.publicAddress });
    console.log(`Balance for person B: ${personBBalance}`);
    await nextStep();
    const yishaiBalance = yishai.getBalanceFor({ payload: yishai.publicAddress });
    console.log(`Balance for Yishai(miner): ${yishaiBalance}`);
    await nextStep();
    const totalBalance = personABalance + personBBalance + yishaiBalance;
    console.log(`Total balance: ${totalBalance}.`);
    await nextStep();
    console.log('Thank you for participating in this demo. Hope you enjoyed!');
    await rl.close();
})()