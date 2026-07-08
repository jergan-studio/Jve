const Jve = require('jve/server/sdk');
const { runSource } = Jve;
const { parseSource, validateSource, compileSource, runSource } = require('./languageApi');
module.exports = { parseSource, validateSource, compileSource, runSource };
