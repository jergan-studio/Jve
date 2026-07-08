// Jve/server/api.js
const express = require("express");
const runtime = require("../runtime/runtime");

const router = express.Router();

router.post("/parse", (req, res) => {
  const { source = "", options = {} } = req.body || {};
  if (!runtime.parse) return res.status(501).json({ error: "runtime.parse not implemented" });

  const out = runtime.parse(source, options);
  res.json(out);
});

router.post("/validate", (req, res) => {
  const { source = "", options = {} } = req.body || {};
  if (!runtime.validate) return res.status(501).json({ error: "runtime.validate not implemented" });

  const out = runtime.validate(source, options);
  res.json(out);
});

router.post("/run", async (req, res) => {
  const { source = "", context = {}, options = {} } = req.body || {};
  if (!runtime.run) return res.status(501).json({ error: "runtime.run not implemented" });

  try {
    const out = await runtime.run(source, context, options);
    res.json(out);
  } catch (err) {
    res.status(500).json({
      error: "Runtime error",
      message: err?.message ?? String(err),
      diagnostics: [{ msg: err?.message ?? String(err) }]
    });
  }
});

// Optional: compile endpoint if you later add it
router.post("/compile", (req, res) => {
  const { source = "", options = {} } = req.body || {};
  if (!runtime.compile) return res.status(501).json({ error: "runtime.compile not implemented" });

  const out = runtime.compile(source, options);
  res.json(out);
});

module.exports = router;
