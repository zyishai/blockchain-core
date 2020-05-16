const readline = require('readline');

const rl = readline.createInterface(
    process.stdin,
    process.stdout
);

const question = (str) => new Promise(resolve => rl.question(str, resolve));

const Actions = {
    PRINT_BLOCKCHAIN: '1',
    SYNC_BLOCKCHAIN: '2',
    PRINT_TRANSACTIONS: '3',
    MINE_TRANSACTIONS: '4',
    CREATE_TRANSFER: '5',
    SEARCH_TRANSACTION: '6',
    VERIFY_TRANSACTION: '7',
    DISPLAY_WALLET: '8',
    EXIT: '9'
}

const createReader = () => {
    let wallet = null;
    const steps = {
        start: async (walletInstance) => {
            console.clear();
            wallet = walletInstance;
            await wallet.introduce();
            return steps.selectAction();
        },
        selectAction: async () => {
            const answer = await question(
            `What do you want to do?
                1 - Print current blockchain.
                2 - Sync blockchain headers with peers.
                3 - Print pending transactions.
                4 - Mine pending transactions.
                5 - Create a transfer
                6 - Search for a transaction
                7 - Verify a transaction
                8 - Display my wallet
                9 - Exit
            `);
            
            switch(answer) {
                case Actions.PRINT_BLOCKCHAIN: {
                    await wallet.printBlockchain();
                    return steps.selectAction();
                }
                case Actions.SYNC_BLOCKCHAIN: {
                    await wallet.syncBlockchain();
                    return steps.selectAction();
                }
                case Actions.PRINT_TRANSACTIONS: {
                    await wallet.printPendingTransactions();
                    return steps.selectAction();
                }
                case Actions.MINE_TRANSACTIONS: {
                    await wallet.minePendingTransactions();
                    return steps.selectAction();
                }
                case Actions.CREATE_TRANSFER: {
                    return steps.transferInto();
                }
                case Actions.SEARCH_TRANSACTION: {
                    return steps.transactionInfo();
                }
                case Actions.VERIFY_TRANSACTION: {
                    return steps.transactionVerificationInfo();
                }
                case Actions.DISPLAY_WALLET: {
                    return steps.displayWallet();
                }
                case Actions.EXIT: {
                    console.log('Goodbye!');
                    process.exit(0);
                }
                default: {
                    console.log(`Unknown option "${answer}. Try again.`);
                    return steps.selectAction();
                }
            }
        },
        transferInto: async () => {
            const amount = await question('How much to you want to transfer? ');
            const addressee = await question('Who do you want to send it to? ');

            await wallet.makeTransfer(addressee.trim(), amount.trim());
            return steps.selectAction();
        },
        transactionInfo: async () => {
            const txHash = await question('Enter desired transaction hash: ');

            await wallet.emitSearchTransaction(txHash.trim());
            return steps.selectAction();
        },
        transactionVerificationInfo: async () => {
            const txHash = await question('Enter desired transaction hash: ');
            const blockHash = await question('Enter transaction\'s block hash: ');

            await wallet.emitVerifyTransaction(blockHash, txHash);
            return steps.selectAction();
        },
        displayWallet: async () => {
            await wallet.displayInfo();
            return steps.selectAction();
        }
    }

    return steps;
};

module.exports = createReader;