class BloomFilter {
    filter = 0; // 00000..

    constructor(length = 10) {
        this.length = length;
        this.maxMod = length + 1;
    }

    /**
     * Calculate the filter hashes of a specific value.
     * 
     * @param {Number} value.
     * @returns {Number[]} indexes to turn on for the value.
     */
    calculateHashes(value) {
        const hashes = [
            n => Number.parseInt(n.toString(2).split('').filter((_, i) => i % 2 === 0).join(''), 2) % this.maxMod,
            n => Number.parseInt(n.toString(2).split('').filter((_, i) => i % 2 !== 0).join(''), 2) % this.maxMod,
        ];

        return hashes.map(fn => fn(value));
    }

    add(value) {
        // console.log('BloomFilter: new value', value);
        // construct binary matchers for the value based on it's hash indexes.
        const matchers = this.calculateHashes(value).map(index => {
            // console.log('BloomFilter: new index', index);
            const matcherString = index === 0 ? '1' : '1' + '0'.repeat(index-1);

            return Number.parseInt(matcherString, 2);
        });
        // console.log('BloomFilter: calculated matchers', matchers);

        // turn on the appropriate bits in the filter.
        matchers.forEach(matcher => {
            this.filter = this.filter | matcher;
        });
    }

    has(value) {
        // construct binary matchers for the value based on it's hash indexes.
        const matchers = this.calculateHashes(value).map(index => {
            const matcherString = index === 0 ? '1' : '1' + '0'.repeat(index-1);

            return Number.parseInt(matcherString, 2);
        });

        return matchers.every(matcher => (this.filter & matcher) === matcher);
    }

    clear() {
        this.filter = 0;
    }
}

if (global && global.window) {
    window.BloomFilter = BloomFilter;
} else {
    module.exports = BloomFilter;
}