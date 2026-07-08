// Jve/server/languageApi.js
const { parse } = require('../runtime/parser');
const { validate } = require('../runtime/runtime'); // adjust names if different
const { compile } = require('../runtime/runtime');  // adjust
const { createRuntime } = require('../runtime/runtime'); // adjust

function diagnosticsToPayload(diagnostics) {
  if (!diagnostics) return { errors: [], warnings: [] };
  return {
    errors: diagnostics.errors ?? [],
    warnings: diagnostics.warnings ?? []
  };
}

function parseSource(source, options = {}) {
  const out = parse(source, options);
  return {
    ast: out.ast ?? out,
    diagnostics: diagnosticsToPayload(out.diagnostics ?? out)
  };
}

function validateSource(source, options = {}) {
  const out = validate(source, options);
  return diagnosticsToPayload(out.diagnostics ?? out);
}

function compileSource(source, options = {}) {
  const out = compile(source, options);
  return {
    compiled: out.compiled ?? out.bytecode ?? out.plan ?? out,
    diagnostics: diagnosticsToPayload(out.diagnostics ?? out)
  };
}

function runSource(source, context = {}, options = {}) {
  const rt = createRuntime(context, options);
  // If your runtime already has an "execute" entry, call it:
  // return rt.execute(source, options);
  // Otherwise adapt to your actual runtime exports.
  const result = rt.run
    ? rt.run(source, options)
    : rt.execute
      ? rt.execute(source, options)
      : rt.start
        ? rt.start(source, options)
        : (() => { throw new Error('Runtime entry not found: expected rt.run/execute/start'); })();

  return { result, diagnostics: diagnosticsToPayload(result?.diagnostics) };
}

module.exports = {
  parseSource,
  validateSource,
  compileSource,
  runSource
};
