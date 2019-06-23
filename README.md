# read-chunks

Uses `read-chunk` to read files in chunks.

# Usage

```javascript
import readChunks from "read-chunks"

// read a file with chunk size of 6 bytes
readChunks(__dirname + "/test.input", 6, (chunk, readNextChunk) => {
	// do something with chunk
	// call readNextChunk when
	// you are done processing the chunk.
	let string = chunk.toString("utf-8")

	console.log("Got chunk: " + string.split("\n").join(""))

	// read next chunk after
	// a second has passed
	setTimeout(readNextChunk, 1000)
})
.then(() => {
	console.log("Done")
})
.catch((error) => {
	console.log("Woops..", error)	
})
```
