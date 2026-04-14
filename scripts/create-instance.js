// Create Component Instance
// Usage: node figma-cli.js run scripts/create-instance.js
// Before running, set COMPONENT_ID and optionally PARENT_ID via eval or modify this file.
//
// Example with eval first:
//   node figma-cli.js eval "return (await figma.getNodeByIdAsync('PAGE_ID')).children.filter(n => n.type === 'COMPONENT').map(c => ({id: c.id, name: c.name}))"
//   Then edit COMPONENT_ID below and run.

const COMPONENT_ID = "REPLACE_ME";
const PARENT_ID = null;

const component = await figma.getNodeByIdAsync(COMPONENT_ID);
if (!component || component.type !== "COMPONENT") {
  return { error: `Component not found: ${COMPONENT_ID}` };
}

const instance = (component).createInstance();

if (PARENT_ID) {
  const parent = await figma.getNodeByIdAsync(PARENT_ID);
  if (parent && "appendChild" in parent) {
    parent.appendChild(instance);
  }
}

return {
  instanceId: instance.id,
  name: instance.name,
  componentId: COMPONENT_ID,
  width: instance.width,
  height: instance.height,
};
