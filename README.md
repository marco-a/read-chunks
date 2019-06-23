# read-chunks

Uses `read-chunk` to read files in chunks.

# Usage

```javascript
import readChunks from "read-chunks"

// read a file with chunk size of 6 bytes
readChunks(__dirname + "/test.input", 6, (e) => {
	// do something with chunk
	// call readNextChunk when
	// you are done processing the chunk.
	let line = e.chunk.toString("utf-8")
	line = line.split("\n").join("")

	let percentage = (e.percentage * 100).toFixed(2)

	console.log("[" + percentage + "%] Got chunk: " + line)

	// read next chunk after
	// a second has passed
	if (e.readNextChunk) {
		setTimeout(e.readNextChunk, 1000)
	}
})
.then(() => {
	console.log("Done")
})
.catch((error) => {
	console.log("Woops..", error)	
})
```
