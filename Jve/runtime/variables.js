function stripQuotes(s) {
  const t = (s ?? "").trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1);
  }
  return null;
}

function isNumberLiteral(s) {
  return /^-?\d+(\.\d+)?$/.test((s ?? "").trim());
}

function isStringConcatExpr(s) {
  return (s ?? "").includes(" + ");
}

function evalExpr(expr, env) {
  const t = (expr ?? "").trim();
  if (!t) return undefined;

  const q = stripQuotes(t);
  if (q !== null) return q;

  if (t === "true") return true;
  if (t === "false") return false;

  if (isNumberLiteral(t)) return Number(t);

  // Support: "Hello, " + username
  if (isStringConcatExpr(t)) {
    const parts = t.split(" + ").map(p => p.trim());
    return parts.map(p => evalExpr(p, env)).join("");
  }

  // identifier
  if (Object.prototype.hasOwnProperty.call(env.vars, t)) return env.vars[t];

  return undefined;
}

function setVar(name, value, env) {
  env.vars[name] = value;
}

function getVar(name, env) {
  return env.vars[name];
}

module.exports = { evalExpr, setVar, getVar };
