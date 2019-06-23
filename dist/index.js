"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _promiseWaterfall = _interopRequireDefault(require("promise-waterfall"));

var _readChunk = _interopRequireDefault(require("read-chunk"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * Copyright (c) 2019 Marco Agnoli
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
 * OR OTHER DEALINGS IN THE SOFTWARE.
 */
var sync = function sync(file, chunkSize, onChunk) {
  return new Promise(function (resolve, reject) {
    try {
      var fSize = _fs["default"].statSync(file).size;

      var nChunks = Math.floor(fSize / chunkSize);
      var reminder = fSize % chunkSize;
      var bytesRead = 0; // read chunks

      for (var i = 0; i < nChunks; ++i) {
        var chunk = _readChunk["default"].sync(file, bytesRead, chunkSize);

        bytesRead += chunkSize;
        onChunk({
          chunk: chunk,
          readNextChunk: null,
          percentage: bytesRead / fSize
        });
        chunk = null;
      } // read reminder


      if (reminder > 0) {
        var _chunk = _readChunk["default"].sync(file, bytesRead, reminder);

        bytesRead += reminder;
        onChunk({
          chunk: _chunk,
          readNextChunk: null,
          percentage: bytesRead / fSize
        });
        _chunk = null;
      }

      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

var mod = function mod(file, chunkSize, onChunk) {
  return new Promise(function (resolve, reject) {
    // get file size
    var fSize = _fs["default"].statSync(file).size; // calculate chunks


    var nChunks = Math.floor(fSize / chunkSize); // calculate reminder

    var reminder = fSize % chunkSize; // number of bytes read

    var bytesRead = 0; // read chunk function

    var readChunkFunction = function readChunkFunction(offset, length) {
      return new Promise(function (resolve, reject) {
        (0, _readChunk["default"])(file, offset, length).then(function (chunk) {
          bytesRead += length;
          onChunk({
            chunk: chunk,
            readNextChunk: function readNextChunk() {
              chunk = null;
              resolve();
            },
            percentage: bytesRead / fSize
          });
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
};

mod.sync = sync;
var _default = mod;
exports["default"] = _default;

