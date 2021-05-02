import { Compress } from 'Compress.js'

export { getStore };
    
type SpeedStoreConfig  = {
    store: GoogleAppsScript.Properties.Properties;
    prefix: string;

}

class SpeedStore {
    store: GoogleAppsScript.Properties.Properties;
    memcache: any;
    prefix: string;
    numChunks: number;
    constructor(config?: SpeedStoreConfig) {
        if (config) {
            this.store = PropertiesService.getUserProperties();
            this.prefix = 'speedstore_'
            this.numChunks = 50
        }
    }

    get(key: string) {
        // Get's the value for a given key - Need to check if the key exists

        if (!this.memcache) {
            this.retrieveAll();
        }
        if (key in this.memcache) {
            return JSON.parse(this.memcache[key]);
        } else {
            return null;
        }
    }

    retrieveAll() {
        const allStrings = this.store.getProperties();
        for (const key in allStrings) {
            if (!key.startsWith(this.prefix)) {
                delete allStrings[key]
            }
        }

        const encodedString = Object.keys(allStrings)
            .sort()
            .reduce((storeString, key) => {
                if (key.startsWith(this.prefix)) {
                    storeString+=allStrings[key]
                }
                return storeString;
            }, '');
        
        this.memcache =  Compress.decompress(encodedString)

    }

    putAll() {
        if (!this.memcache) {
            this.retrieveAll()
        }
        const encodedString = Compress.compress(this.memcache)

        const chunks = chunkString(encodedString, this.numChunks)

        chunks.reduce((chunkedProps, chunk, idx) => {
            chunkedProps[`${this.prefix}_${idx}`] = chunk

            return chunkedProps
        }, {})

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
            this.retrieveAll()
        }
        this.memcache[key] = value
        this.putAll()
    }

    setMany(properties: { [key: string]: any }) {
        for (const key in properties) {
            this.memcache[key] = properties[key];
        }
        this.putAll()
    }
}

var store: SpeedStore;

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