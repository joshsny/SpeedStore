import { getStore, SpeedStore } from "SpeedStore";


const runTests = () => {
    testSpeedStore();
    // clean up
    PropertiesService.getScriptProperties().deleteAllProperties();

    testCrusher();
    // clean up
    PropertiesService.getScriptProperties().deleteAllProperties();
};

const testCrusher = () => {
    const start = new Date();
    testOne("tiny", 8);
    testOne("small", 256);
    testOne("big", 1024);
    testOne("bigger", 4096);
    testOne("huge", 32768);
    const end = new Date();
    console.log(`Crusher - total time: ${+end - +start}`);
};

const testOne = (key, length) => {
    const data = makeData(length);
    crusher.put(key, data);
    console.log(`key: ${key}`);
    const recover = crusher.get(key);
    if (JSON.stringify(recover) !== JSON.stringify(data)) throw key + "failed";
};

const testSpeedStore = () => {
    const start = new Date();
    testOneSpeedStore("tiny", 8);
    testOneSpeedStore("small", 256);
    testOneSpeedStore("big", 1024);
    testOneSpeedStore("bigger", 4096);
    testOneSpeedStore("huge", 32768);
    const end = new Date();
    console.log(`SpeedStore - total time: ${+end - +start}`);
};

const testOneSpeedStore = (key, length) => {
    const data = makeData(length);
    store.set(key, data);
    console.log(`key: ${key}`);
    const recover = store.get(key);
    if (JSON.stringify(recover) !== JSON.stringify(data)) throw key + "failed";
};

const crusher = new bmCrusher.CrusherPluginPropertyService().init({
    store: PropertiesService.getScriptProperties(),
});

const store: SpeedStore = new SpeedStore()

const makeData = (length) => Array.from({ length }, () => Math.random());
