const express = require('express');
const { parseSource, validateSource, compileSource, runSource } = require('./languageApi');

const router = express.Router();

// POST /jve/parse
router.post('/parse', (req, res) => {
  const { source, options } = req.body;
  const out = parseSource(source, options);
  res.json(out);
});

// POST /jve/validate
router.post('/validate', (req, res) => {
  const { source, options } = req.body;
  const out = validateSource(source, options);
  res.json(out);
});

// POST /jve/compile
router.post('/compile', (req, res) => {
  const { source, options } = req.body;
  const out = compileSource(source, options);
  res.json(out);
});

// POST /jve/run
router.post('/run', (req, res) => {
  const { source, context, options } = req.body;
  const out = runSource(source, context, options);
  res.json(out);
});

module.exports = router;
