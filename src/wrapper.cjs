const { default: defaultFn, ...rest } = require('./index.umd.js');

module.exports = defaultFn;
Object.assign(module.exports, rest);
