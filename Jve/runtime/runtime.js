// Jve/runtime/runtime.js
const parser = require("./parser");
const exec = require("./runtimeCore");

module.exports = {
  parse: (source, options) => parser.parse(source, options),
  validate: (source, options) => {
    const out = parser.parse(source, options);
    const errors = out?.diagnostics?.errors ?? [];
    return { diagnostics: { errors, warnings: out?.diagnostics?.warnings ?? [] } };
  },
  compile: (source, options) => {
    const out = parser.parse(source, options);
    return { plan: out.plan, diagnostics: out.diagnostics };
  },
  run: async (source, context = {}, options = {}) => {
    const out = parser.parse(source, options);
    if (out.diagnostics?.errors?.length) {
      return { result: null, diagnostics: out.diagnostics, plan: out.plan };
    }
    const result = await exec.executePlan(out.plan, context, options);
    return { result, diagnostics: out.diagnostics };
  }
};
