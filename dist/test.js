"use strict";

var _index = _interopRequireDefault(require("./index.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// read a file with chunk size of 6 bytes
(0, _index["default"])(__dirname + "/test.input", 6, function (chunk, readNextChunk) {
  // do something with chunk
  // call readNextChunk when
  // you are done processing the chunk.
  var string = chunk.toString("utf-8");
  console.log("Got chunk: " + string.split("\n").join("")); // read next chunk after
  // a second has passed

  setTimeout(readNextChunk, 1000);
}).then(function () {
  console.log("Done");
})["catch"](function (error) {
  console.log("Woops..", error);
});

