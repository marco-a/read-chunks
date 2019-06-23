#!/bin/sh -eufx

./node_modules/.bin/babel src/index.js > dist/index.js
./node_modules/.bin/babel src/test.js > dist/test.js
cp src/test.input dist/test.input
