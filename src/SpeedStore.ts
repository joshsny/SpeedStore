import { Compress } from 'Compress.js'

export { SpeedStore };
    
type SpeedStoreConfig  = {
    store?: GoogleAppsScript.Properties.Properties;
    prefix?: string;
    numChunks?: number;
    encode?: (_obj: any) => string;
    decode?: (encodedString: string) => any;
}

class SpeedStore {
    store: GoogleAppsScript.Properties.Properties;
    memcache: any;
    prefix: string;
    numChunks: number;
    encode: (_obj: any) => string;
    decode: (encodedString: string) => any;
    constructor(config: SpeedStoreConfig = {}) {
        this.store = config.store || PropertiesService.getScriptProperties();
        this.prefix = config.prefix || "speedstore_";
        this.numChunks = config.numChunks || 50;
        this.encode = config.encode || encode;
        this.decode = config.decode || decode;
    }

    get(key: string) {
        // Get's the value for a given key - Need to check if the key exists

        if (true) { // Trialing to always fetch from store
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
        console.log(`${key} exists? ${key in this.memcache}`);
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
}

// var store;

// const getStore = (): SpeedStore => {
//     if (!store) {
//         store = new SpeedStore();
//     }

//     return store;
// };

const chunkString = (str: string, numChunks: number): string[] => {
    const size = Math.max(Math.ceil(str.length / numChunks), 1)
    const chunks = new Array(numChunks)

    for (let i = 0, stringPos = 0; i < numChunks; ++i, stringPos += size) {
        chunks[i] = str.substr(stringPos, size)
    }
    return chunks
}

const encode = (_obj: any): string => {
    // let blob = Utilities.newBlob(JSON.stringify(_obj));
    // blob = Utilities.gzip(blob);
    // console.log(`blob content type ${blob.getContentType()}`);
    // const encodedString = blob.getDataAsString();
    // console.log(`string after encode: ${encodedString}. blob content type ${blob.getContentType()}`)
    return Compress.compress(_obj)
}

const decode = (encodedString: string): any => {
    // console.log(`string before decode: ${encodedString}`);
    // let blob = Utilities.newBlob(encodedString, "application/x-gzip");
    // console.log(`blob`)
    // const _obj = Utilities.ungzip(blob).getDataAsString()

    const _obj = Compress.decompress(encodedString)

    return _obj
}

const zeroPad = (num, places) => String(num).padStart(places, '0')

const numDigits = (num) => (Math.log(num) * Math.LOG10E + 1) | 0;