// Boolean Operations (Union / Subtract / Intersect / Exclude)
// Usage: node figma-cli.js run scripts/boolean-ops.js
// Edit NODE_IDS and OPERATION before running.

const NODE_IDS = ["REPLACE_ID_1", "REPLACE_ID_2"];
const OPERATION = "UNION";

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
