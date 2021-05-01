export { Compress }
const Compress = (() => {

  const replacer = (key, value) => value === null ? undefined : value;
  const stringifyDropNulls = (obj) => JSON.stringify(obj, replacer);


  /**
   *
   * @param {string} str b64 string to decompress
   * @return {object} original object
   */
  const decompress = (str) => {
    return JSON.parse(decompressString(str));
  };
  /**
   *
   * @param {string} str b64 string to decompress
   * @return {string}
   */
  const decompressString = (str) => {
    return LZString.decompressFromBase64(str);
  };

  const compress = (obj) => {
    return compressString(stringifyDropNulls(obj));
  };

  /**
   *
   * @param {string} str string to compress
   * @return {string} as base64
   */
  const compressString = (str) => LZString.compressToBase64(str);

  return {
    decompress,
    decompressString,
    compress,
    compressString
  };
})();