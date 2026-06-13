// Boolean Operations (Union / Subtract / Intersect / Exclude)
// Usage: node figma-cli.js tpl boolean-ops --ids "1:23,4:56" [--op UNION]

const NODE_IDS = "{{ids}}".split(",").map(s => s.trim());
const OPERATION = "{{op|UNION}}";

const nodes = [];
for (const id of NODE_IDS) {
  const n = await figma.getNodeByIdAsync(id);
  if (!n) return { error: `Node not found: ${id}` };
  nodes.push(n);
}

let result;
switch (OPERATION) {
  case "UNION":
    result = figma.union(nodes, nodes[0].parent);
    break;
  case "SUBTRACT":
    result = figma.subtract(nodes, nodes[0].parent);
    break;
  case "INTERSECT":
    result = figma.intersect(nodes, nodes[0].parent);
    break;
  case "EXCLUDE":
    result = figma.exclude(nodes, nodes[0].parent);
    break;
  default:
    return { error: `Unknown operation: ${OPERATION}. Use UNION/SUBTRACT/INTERSECT/EXCLUDE` };
}

return {
  resultId: result.id,
  name: result.name,
  operation: OPERATION,
  inputNodes: NODE_IDS.length,
};
