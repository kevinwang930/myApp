/* eslint import/prefer-default-export: off, import/no-mutable-exports: off */
const {URL} = require('url')
const path = require('path')

let resolveHtmlPath

if (process.env.NODE_ENV === 'development') {
	const port = process.env.PORT || 1212
	resolveHtmlPath = (htmlFileName) => {
		const url = new URL(`http://localhost:${port}`)
		url.pathname = htmlFileName
		return url.href
	}
} else {
	resolveHtmlPath = (htmlFileName) => {
		return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`
	}
}

module.exports = {
	resolveHtmlPath,
}
