"use strict";

var _index = _interopRequireDefault(require("./index.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// read a file with chunk size of 6 bytes
(0, _index["default"])(__dirname + "/test.input", 4096, function (e) {
  // do something with chunk
  // call readNextChunk when
  // you are done processing the chunk.
  var line = e.chunk.toString("utf-8");
  line = line.split("\n").join("");
  var percentage = (e.percentage * 100).toFixed(2);
  console.log("[" + percentage + "%] Got chunk: " + line); // read next chunk after
  // a second has passed

  if (e.readNextChunk) {
    setTimeout(e.readNextChunk, 1000);
  }
}).then(function () {
  console.log("Done");
})["catch"](function (error) {
  console.log("Woops..", error);
});

