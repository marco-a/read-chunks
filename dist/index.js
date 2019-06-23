"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = _default;

var _fs = _interopRequireDefault(require("fs"));

var _promiseWaterfall = _interopRequireDefault(require("promise-waterfall"));

var _readChunk = _interopRequireDefault(require("read-chunk"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _default(file, chunkSize, onChunk) {
  return new Promise(function (resolve, reject) {
    // get file size
    var fSize = _fs["default"].statSync(file).size; // calculate chunks


    var nChunks = Math.floor(fSize / chunkSize); // calculate reminder

    var reminder = fSize % chunkSize; // read chunk function

    var readChunkFunction = function readChunkFunction(offset, length) {
      return new Promise(function (resolve, reject) {
        (0, _readChunk["default"])(file, offset, length).then(function (chunk) {
          onChunk(chunk, resolve);
        })["catch"](reject);
      });
    }; // build sequence


    var sequence = [];

    for (var i = 0; i < nChunks; ++i) {
      var offset = i * chunkSize;
      var length = chunkSize;
      sequence.push(readChunkFunction.bind(null, offset, length));
    }

    if (reminder > 0) {
      var _offset = nChunks * chunkSize;

      var _length = reminder;
      sequence.push(readChunkFunction.bind(null, _offset, _length));
    } // run sequence in a waterfall fashion


    (0, _promiseWaterfall["default"])(sequence).then(resolve)["catch"](reject);
  });
}

