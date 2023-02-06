import { LZipper_ } from "LZipper";

export { SpeedStore_ };

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
    constructor(config: SpeedStoreConfig) {
        this.store = config.store;
        this.prefix = config.prefix || "speedstore_";
        this.numChunks = config.numChunks || 50;
        this.applyCompression = config.applyCompression || false;
        this.encode =
            config.encode || config.applyCompression ? encode_ : JSON.stringify;
        this.decode =
            config.decode || config.applyCompression ? decode_ : JSON.parse;
    }

    get(key: string) {
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

    exists(key: string) {
        if (!this.memcache) {
            this.retrieveAll();
        }
        return this.memcache.has(key);
    }

    set(key: string, value: unknown) {
        if (!this.memcache) {
            this.retrieveAll();
        }
        this.memcache.set(key, value);
        this.putAll();
    }

    setMany(properties: { [key: string]: unknown }) {
        if (!this.memcache) {
            this.retrieveAll();
        }

        for (const [key, value] of Object.entries(properties)) {
            this.memcache.set(key, value);
        }
        this.putAll();
    }

    delete(key: string) {
        if (!this.memcache) {
            this.retrieveAll();
        }

        const existed = this.memcache.delete(key);

        if (existed) {
            this.putAll();
        }
    }

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
    const decoded = LZipper_.decompress(JSON.parse(encodedString));

    return decoded;
};

const zeroPad_ = (num, places) => String(num).padStart(places, "0");

const numDigits_ = (num) => (Math.log(num) * Math.LOG10E + 1) | 0;
