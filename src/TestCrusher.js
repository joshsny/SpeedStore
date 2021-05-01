const testAll = (crusher) => {
  testOne(crusher, 100, 'small')
  testOne(crusher, 1000, 'big')
  testOne(crusher, 100, 'smallanother', 60)
  testOne(crusher, 10000, 'biganother', 60)
  testOne(crusher, 50000, "huge", 60)
}

const testOne = (crusher, length, key, expiry) => {
  const data = makeData(length);
  crusher.put(key, data)
  console.log(`key: ${key}`)
  const recover = crusher.get(key)
  if (JSON.stringify(recover) !== JSON.stringify(data)) throw key + 'failed' 
}

const makeData = (length) => Array.from({ length }, () => Math.random());

const testExpired = (crusher) => {
  const recover = crusher.get('smallanother')
  const r = crusher.get('biganother')
  if (!r) console.log('biganother expired')
  if (!recover) console.log('smallanother expired')
}


const saveKey = () => {
  PropertiesService.getUserProperties().setProperty('usrwkey', 'yYL5u1uCLTrB9EEUhL_kagDAYKeslq-MBg720_-q')
}