module.exports = {
    stringifyToBuffer: (obj) => Buffer.from(JSON.stringify(obj), 'utf-8'),
}
