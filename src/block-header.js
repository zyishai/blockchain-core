class BlockHeader {
    constructor(hash, previousHash, timestamp, nonce, merkleRoot) {
        this.hash = hash;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.nonce = nonce;
        this.merkleRoot = merkleRoot;
    }
}

module.exports = BlockHeader;