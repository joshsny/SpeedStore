import { LZipper } from 'LZipper';

export { SpeedStore };
    
type SpeedStoreConfig  = {
    store?: GoogleAppsScript.Properties.Properties;
    prefix?: string;
    numChunks?: number;
    applyCompression?: boolean;
    encode?: (_obj: any) => string;
    decode?: (encodedString: string) => any;
}

class SpeedStore {
    store: GoogleAppsScript.Properties.Properties;
    memcache: any;
    prefix: string;
    numChunks: number;
    applyCompression: boolean;
    encode: (_obj: any) => string;
    decode: (encodedString: string) => any;
    constructor(config: SpeedStoreConfig = {}) {
        this.store = config.store || PropertiesService.getScriptProperties();
        this.prefix = config.prefix || "speedstore_";
        this.numChunks = config.numChunks || 50;
        this.applyCompression = config.applyCompression || false;
        this.encode = config.encode || config.applyCompression ? encode : JSON.stringify;
        this.decode = config.decode || config.applyCompression ? decode : JSON.parse;
    }

    get(key: string) {
        // Get's the value for a given key - Need to check if the key exists

        if (!this.memcache) { // Trialing to always fetch from store
            this.retrieveAll();
        }
        if (key in this.memcache) {
            return this.memcache[key];
        } else {
            return null;
        }
    }

    retrieveAll() {
        const allStrings = this.store.getProperties();
        // Recreate encoded string from properties
        const sortedKeys = Object.keys(allStrings).sort();
        const encodedString = sortedKeys.reduce((storeString, key) => {
                if (key.startsWith(this.prefix)) {
                    storeString += allStrings[key];
                }
                return storeString;
            }, "");

        if (encodedString !== "") {
            let start = new Date();
            this.memcache = this.decode(encodedString);
            let end = new Date();
            console.log(`decoding time: ${+end - +start}`);
        } else {
            this.memcache = {};
        }
    }

    putAll() {
        if (!this.memcache) {
            this.retrieveAll();
        }

        let start = new Date();
        const encodedString = this.encode(this.memcache);
        let end = new Date();
        const sizeReduction =
            (encodedString.length * 100) / JSON.stringify(this.memcache).length;
        console.log(
            `encoding time: ${
                +end - +start
            }. approx. end size: ${sizeReduction.toFixed(2)}%`
        );

        const chunks = chunkString(encodedString, this.numChunks);

        const props = chunks.reduce((chunkedProps, chunk, idx) => {
            chunkedProps[`${this.prefix}_${zeroPad(idx, numDigits(this.numChunks))}`] = chunk;

            return chunkedProps;
        }, {});

        this.store.setProperties(props);
    }

    exists(key: string) {
        if (!this.memcache) {
            this.retrieveAll();
        }
        return key in this.memcache;
    }

    set(key: string, value: any) {
        if (!this.memcache) {
            this.retrieveAll();
        }
        this.memcache[key] = value;
        this.putAll();
    }

    setMany(properties: { [key: string]: any }) {
        for (const key in properties) {
            this.memcache[key] = properties[key];
        }
        this.putAll();
    }

    delete(key: string) {
        if (!this.memcache) {
            this.retrieveAll();
        }

        if (key in this.memcache) {
            delete this.memcache[key]
        }

        this.putAll()
    }
    deleteAll() {
        const keys = this.store.getKeys()

        for (const key of keys) {
            if (key.startsWith(this.prefix)) {
            this.store.deleteProperty(key)
            }
        }
    }
}

var store;

const getStore = (): SpeedStore => {
    if (!store) {
        store = new SpeedStore();
    }

    return store;
};

const chunkString = (str: string, numChunks: number): string[] => {
    const size = Math.max(Math.ceil(str.length / numChunks), 1)
    const chunks = new Array(numChunks)

    for (let i = 0, stringPos = 0; i < numChunks; ++i, stringPos += size) {
        chunks[i] = str.substr(stringPos, size)
    }
    return chunks
}

const encode = (_obj: any): string => {

    const encoded = LZipper.compress(JSON.stringify(_obj))
    return encoded
}

const decode = (encodedString: string): any => {

    const decoded = LZipper.decompress(JSON.parse(encodedString));

    return decoded
}

const zeroPad = (num, places) => String(num).padStart(places, '0')

const numDigits = (num) => (Math.log(num) * Math.LOG10E + 1) | 0;