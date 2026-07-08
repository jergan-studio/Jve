// Jve/runtime/runtimeCore.js
function stripQuotes(s) {
  const t = s.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1);
  }
  return null;
}

function evalExpr(expr, vars) {
  const t = (expr ?? "").trim();

  const q = stripQuotes(t);
  if (q !== null) return q;

  if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t);

  if (t === "true") return true;
  if (t === "false") return false;

  // very small concat: "a" + b
  if (t.includes(" + ")) {
    const parts = t.split(" + ").map(p => p.trim());
    return parts.map(p => evalExpr(p, vars)).join("");
  }

  // identifier
  if (Object.prototype.hasOwnProperty.call(vars, t)) return vars[t];

  return undefined;
}

function executeRawStmt(text, env) {
  // Placeholder for your real commands/html/js/etc integration.
  // For now, do nothing but allow future wiring.
  env.events.push({ type: "raw", text });
}

async function executePlan(plan, context, options) {
  const vars = {};
  const env = {
    vars,
    context,
    options,
    events: [],
    effects: [],
    browser: context?.browser ?? {},
    dom: context?.dom ?? {},
    js: context?.js ?? {}
  };

  // Provide a "global" console for inline js blocks
  const sandboxConsole = {
    log: (...args) => env.effects.push({ type: "console.log", args }),
    warn: (...args) => env.effects.push({ type: "console.warn", args }),
    error: (...args) => env.effects.push({ type: "console.error", args })
  };

  // Execute top-level statements/blocks
  for (const node of plan) {
    if (node.type === "stmt") {
      if (node.stmt === "set") {
        vars[node.name] = evalExpr(node.valueExpr, vars);
        continue;
      }
      if (node.stmt === "jsInline") {
        // eslint-disable-next-line no-new-func
        const fn = new Function("console", "vars", "context", node.code);
        fn(sandboxConsole, vars, context);
        continue;
      }
      if (node.stmt === "raw") {
        executeRawStmt(node.text, env);
        continue;
      }
    }

    if (node.type === "block") {
      if (node.kind === "js") {
        // eslint-disable-next-line no-new-func
        const fn = new Function("console", "vars", "context", node.code);
        fn(sandboxConsole, vars, context);
        continue;
      }
      if (node.kind === "on") {
        // Store event registrations as effects; real DOM wiring later.
        env.effects.push({
          type: "registerEvent",
          selector: node.selector,
          event: node.event,
          body: node.body.map(s => s.text)
        });
        continue;
      }
      // generic blocks: just store
      env.effects.push({ type: "block", kind: node.kind, head: node.head, body: node.body.map(s => s.text) });
    }
  }

  return {
    vars,
    effects: env.effects,
    events: env.events
  };
}

module.exports = { executePlan };
