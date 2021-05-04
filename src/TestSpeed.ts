import { SpeedStore } from "SpeedStore";


const runTests = () => {
    PropertiesService.getScriptProperties().deleteAllProperties();
    testSpeedStore();
    PropertiesService.getScriptProperties().deleteAllProperties();
    testCrusher();
    PropertiesService.getScriptProperties().deleteAllProperties();
};

const testCrusher = () => {
    const start = new Date();
    testOne("tiny", 2**6);
    testOne("small", 2**8);
    testOne("big", 2**10);
    testOne("bigger", 2**12);
    testOne("huge", 2**14);
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
    testOneSpeedStore("tiny", 2**6);
    testOneSpeedStore("small", 2**8);
    testOneSpeedStore("big", 2**10);
    testOneSpeedStore("bigger", 2**12);
    testOneSpeedStore("huge", 2**14);
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

const makeData = (length) => Array.from({ length }, () => Math.random());
