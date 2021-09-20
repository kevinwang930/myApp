const {execSync} = require('child_process')

let buffer = execSync('git status --porcelain=v1')
console.log(buffer.length)
let string = buffer.toString()
console.log(string)
