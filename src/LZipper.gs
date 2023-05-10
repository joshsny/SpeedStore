var exports = exports || {};
var module = module || { exports: exports };
exports.LZipper_ = void 0;
var LZipper_ = (function () {
    var API;
    function compress(data) {
      var blobIn = Utilities.gzip(Utilities.newBlob(data)); 
      var textIn = Utilities.base64Encode(blobIn.getBytes());
      return textIn;
    }
    function decompress(str) {
      var byteArrayOut = Utilities.base64Decode(str);
      var blobOut = Utilities.newBlob(byteArrayOut).setContentType('application/x-gzip');
      blobOut = Utilities.ungzip(blobOut);
      var textOut = blobOut.getDataAsString();
      return textOut;
    }
    API = {
        // exposed interface for LZipper
        compress: compress,
        decompress: decompress
    };
    return API;
})();
exports.LZipper_ = LZipper_;
