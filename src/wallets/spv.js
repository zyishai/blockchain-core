const BlockHeader = require('../block-header');
const WalletBase = require('./base');

class SPVWallet extends WalletBase {
    /**
     * SPV wallet's constructor.
     * 
     * @param {BlockHeader[]} blockHeaders 
     */
    constructor(name) {
        super(name);
    }

    getBlockHeaders({ payload }) {
        /**
         * @type {BlockHeader[]}
         */
        this.blockHeaders = payload;
        console.log('Synced chain:\n', this.blockHeaders);
    }
}

module.exports = SPVWallet;