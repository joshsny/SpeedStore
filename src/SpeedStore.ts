import { LZipper_ } from "LZipper";

export { SpeedStore_ };

/**
 * Configuration for SpeedStore.
 * @typedef {Object} SpeedStoreConfig
 * @property {GoogleAppsScript.Properties.Properties} store - The store object.
 * @property {string} [prefix] - Optional prefix for the store.
 * @property {number} [numChunks] - Optional number of chunks.
 * @property {boolean} [applyCompression] - Optional flag indicating whether to apply compression.
 * @property {function} [encode] - Optional custom encoding function.
 * @property {function} [decode] - Optional custom decoding function.
 */
type SpeedStoreConfig = {
    store: GoogleAppsScript.Properties.Properties;
    prefix?: string;
    numChunks?: number;
    applyCompression?: boolean;
    encode?: (_obj: unknown) => string;
    decode?: (encodedString: string) => unknown;
};

class SpeedStore_ {
    store: GoogleAppsScript.Properties.Properties;
    memcache?: Map<string, unknown>;
    prefix: string;
    numChunks: number;
    applyCompression: boolean;
    encode: (_obj: unknown) => string;
    decode: (encodedString: string) => unknown;

    /**
     * Create a SpeedStore.
     * @param {SpeedStoreConfig} config - Configuration for the SpeedStore.
     */
    constructor(config: SpeedStoreConfig) {
        this.store = config.store;
        this.prefix = config.prefix || "speedstore_";
        this.numChunks = config.numChunks || 50;
        this.applyCompression = config.applyCompression || false;
        this.encode =
            config.encode ||
            (config.applyCompression ? encode_ : JSON.stringify);
        this.decode =
            config.decode || (config.applyCompression ? decode_ : JSON.parse);
    }

    /**
     *  Returns the value associated with the key.
     *
     *  @param {string} key The key to retrieve the value for.
     *  @return {unknown} The value associated with the key.
     *
     */
    get(key: string): unknown {
        if (!this.memcache) {
            this.retrieveAll();
        }

        const value = this.memcache.get(key) ?? null;

        const deepClone = this.decode(this.encode(value));

        return deepClone;
    }

    retrieveAll() {
        const allStrings = this.store.getProperties();
        const sortedKeys = Object.keys(allStrings).sort();
        const encodedString = sortedKeys.reduce((storeString, key) => {
            if (key.startsWith(this.prefix)) {
                storeString += allStrings[key];
            }
            return storeString;
        }, "");

        if (encodedString !== "") {
            this.memcache = new Map(Object.entries(this.decode(encodedString)));
        } else {
            this.memcache = new Map();
        }
    }

    putAll() {
        if (!this.memcache) {
            this.retrieveAll();
        }

        const encodedString = this.encode(Object.fromEntries(this.memcache));

        const chunks = chunkString_(encodedString, this.numChunks);

        const props = chunks.reduce((chunkedProps, chunk, idx) => {
            chunkedProps[
                `${this.prefix}_${zeroPad_(idx, numDigits_(this.numChunks))}`
            ] = chunk;

            return chunkedProps;
        }, {});

        this.store.setProperties(props);
    }

    /**
     *  Check if a value exists for the given key.
     *
     *  @param {string} key The key to check for.
     *  @return {boolean} True if a value exists for the key, false otherwise.
     *
     */
    exists(key: string) {
        if (!this.memcache) {
            this.retrieveAll();
        }
        return this.memcache.has(key);
    }

    /**
     * Set a value for the given key.
     * @param {string} key The key to set the value for.
     * @param {unknown} value The value to set.
     * @return {void}
     *
     */
    set(key: string, value: unknown) {
        if (!this.memcache) {
            this.retrieveAll();
        }
        this.memcache.set(key, value);
        this.putAll();
    }

    /**
     * Set multiple values for the given keys.
     * @param {Object} properties An object containing key-value pairs to set.
     * @return {void}
     */
    setMany(properties: { [key: string]: unknown }) {
        if (!this.memcache) {
            this.retrieveAll();
        }

        for (const [key, value] of Object.entries(properties)) {
            this.memcache.set(key, value);
        }
        this.putAll();
    }

    /**
     * Delete the value associated with the given key.
     * @param {string} key The key to delete.
     * @return {void}
     */
    delete(key: string) {
        if (!this.memcache) {
            this.retrieveAll();
        }

        const existed = this.memcache.delete(key);

        if (existed) {
            this.putAll();
        }
    }

    /**
     * Delete all key-value pairs associated with the store prefix.
     * @return {void}
     */
    deleteAll() {
        const keys = this.store.getKeys();

        for (const key of keys) {
            if (key.startsWith(this.prefix)) {
                this.store.deleteProperty(key);
            }
        }

        this.memcache = new Map();
    }
}

var store_;

/**
 * Create a SpeedStore.
 * @param {SpeedStoreConfig} config - Configuration for the SpeedStore.
 */
var getStore = (config: SpeedStoreConfig): SpeedStore_ => {
    if (!store_) {
        store_ = new SpeedStore_(config);
    }

    return store_;
};

const chunkString_ = (str: string, numChunks: number): string[] => {
    const size = Math.max(Math.ceil(str.length / numChunks), 1);
    const chunks = new Array(numChunks);

    for (let i = 0, stringPos = 0; i < numChunks; ++i, stringPos += size) {
        chunks[i] = str.substr(stringPos, size);
    }
    return chunks;
};

const encode_ = (_obj: unknown): string => {
    const encoded = LZipper_.compress(JSON.stringify(_obj));
    return encoded;
};

const decode_ = (encodedString: string): unknown => {
    const decoded = JSON.parse(LZipper_.decompress(encodedString));

    return decoded;
};

const zeroPad_ = (num, places) => String(num).padStart(places, "0");

const numDigits_ = (num) => (Math.log(num) * Math.LOG10E + 1) | 0;
