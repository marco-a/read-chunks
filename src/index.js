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

import fs from "fs"
import promiseWaterfall from "promise-waterfall"
import readChunk from "read-chunk"

const sync = function(file, chunkSize, onChunk) {
	return new Promise((resolve, reject) => {
		try {
			const fSize = fs.statSync(file).size
			const nChunks = Math.floor(fSize / chunkSize)
			const reminder = fSize % chunkSize

			let bytesRead = 0

			// read chunks
			for (let i = 0; i < nChunks; ++i) {
				let chunk = readChunk.sync(file, bytesRead, chunkSize)

				bytesRead += chunkSize

				onChunk({
					chunk,
					readNextChunk: null,
					percentage: (bytesRead / fSize)
				})

				chunk = null
			}

			// read reminder
			if (reminder > 0) {
				let chunk = readChunk.sync(file, bytesRead, reminder)

				bytesRead += reminder

				onChunk({
					chunk,
					readNextChunk: null,
					percentage: (bytesRead / fSize)
				})

				chunk = null
			}

			resolve()
		} catch (error) {
			reject(error)
		}
	})
}

const mod = function(file, chunkSize, onChunk) {
	return new Promise((resolve, reject) => {
		// get file size
		const fSize = fs.statSync(file).size
		// calculate chunks
		const nChunks = Math.floor(fSize / chunkSize)
		// calculate reminder
		const reminder = fSize % chunkSize
		// number of bytes read
		let bytesRead = 0

		// read chunk function
		const readChunkFunction = (offset, length) => {
			return new Promise((resolve, reject) => {
				readChunk(file, offset, length)
				.then((chunk) => {
					bytesRead += length

					onChunk({
						chunk,
						readNextChunk: () => {
							chunk = null

							resolve()
						},
						percentage: (bytesRead / fSize)
					})
				})
				.catch(reject)
			})
		}

		// build sequence
		let sequence = []

		for (let i = 0; i < nChunks; ++i) {
			let offset = i * chunkSize
			let length = chunkSize

			sequence.push(readChunkFunction.bind(null, offset, length))
		}

		if (reminder > 0) {
			let offset = nChunks * chunkSize
			let length = reminder

			sequence.push(readChunkFunction.bind(null, offset, length))
		}

		// run sequence in a waterfall fashion
		promiseWaterfall(sequence)
		.then(resolve)
		.catch(reject)
	})
}

mod.sync = sync

export default mod
