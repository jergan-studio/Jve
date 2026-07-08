// Jve/runtime/parser.js
function tokenizeLines(source) {
  return (source ?? "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map(l => l.replace(/\t/g, "  "));
}

function isComment(line) {
  const t = line.trim();
  return !t || t.startsWith("#");
}

function parseBlock(lines, startIndex) {
  // Supports:
  // on "<sel>" <event> ... end
  // js { ... }
  // animate "<sel>" ... end  (treated as generic block for now)
  let i = startIndex;
  const line = lines[i].trim();

  const diagnostics = { errors: [], warnings: [] };
  const body = [];

  if (line.startsWith("on ")) {
    const m = line.match(/^on\s+(.+?)\s+(\w+)\s*$/);
    if (!m) diagnostics.errors.push({ line: i + 1, msg: "Invalid on syntax" });
    const selector = m?.[1]?.trim() ?? "";
    const event = m?.[2] ?? "";

    i++;
    while (i < lines.length) {
      const t = lines[i].trim();
      if (t === "end") break;
      if (!isComment(t)) body.push({ type: "stmt", text: t, line: i + 1 });
      i++;
    }
    if (lines[i]?.trim() !== "end") diagnostics.errors.push({ line: i + 1, msg: "Missing end" });

    return {
      node: { type: "block", kind: "on", selector, event, body },
      nextIndex: i + 1,
      diagnostics
    };
  }

  if (line.startsWith("js {")) {
    i++;
    const jsLines = [];
    while (i < lines.length && lines[i].trim() !== "}") {
      jsLines.push(lines[i]);
      i++;
    }
    if (lines[i]?.trim() !== "}") diagnostics.errors.push({ line: i + 1, msg: "Missing }" });
    return {
      node: { type: "block", kind: "js", code: jsLines.join("\n") },
      nextIndex: i + 1,
      diagnostics
    };
  }

  // Generic block fallback until end
  const m = line.match(/^(\w+)\s+(.+)\s*$/);
  const kind = m?.[1] ?? "block";
  const head = m?.[2] ?? "";
  i++;
  while (i < lines.length) {
    const t = lines[i].trim();
    if (t === "end") break;
    if (!isComment(t)) body.push({ type: "stmt", text: t, line: i + 1 });
    i++;
  }
  if (lines[i]?.trim() !== "end") diagnostics.errors.push({ line: i + 1, msg: "Missing end" });

  return {
    node: { type: "block", kind, head, body },
    nextIndex: i + 1,
    diagnostics
  };
}

function parse(source, options = {}) {
  const lines = tokenizeLines(source);
  const plan = [];
  const diagnostics = { errors: [], warnings: [] };

  let i = 0;
  while (i < lines.length) {
    const raw = lines[i];
    const t = raw.trim();

    if (isComment(t)) {
      i++;
      continue;
    }

    // Block starters
    if (t.startsWith("on ") || t.startsWith("js {") || t.startsWith("animate ")) {
      const { node, nextIndex, diagnostics: d } = parseBlock(lines, i);
      diagnostics.errors.push(...d.errors);
      diagnostics.warnings.push(...d.warnings);
      plan.push(node);
      i = nextIndex;
      continue;
    }

    // set x = value
    if (t.startsWith("set ")) {
      const m = t.match(/^set\s+(\w+)\s*=\s*(.+)$/);
      if (!m) diagnostics.errors.push({ line: i + 1, msg: "Invalid set syntax" });
      else plan.push({ type: "stmt", stmt: "set", name: m[1], valueExpr: m[2], line: i + 1 });
      i++;
      continue;
    }

    // js console.log("x")
    if (t.startsWith("js ")) {
      plan.push({ type: "stmt", stmt: "jsInline", code: t.slice(3).trim(), line: i + 1 });
      i++;
      continue;
    }

    // Fallback: treat as raw statement
    plan.push({ type: "stmt", stmt: "raw", text: t, line: i + 1 });
    i++;
  }

  return { plan, diagnostics };
}

module.exports = { parse };
