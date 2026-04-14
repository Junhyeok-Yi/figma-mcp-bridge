// Create Component Instance
// Usage: node figma-cli.js tpl create-instance --componentId 1:23 [--parentId 4:56]

const COMPONENT_ID = "{{componentId}}";
const PARENT_ID = "{{parentId|}}";

const component = await figma.getNodeByIdAsync(COMPONENT_ID);
if (!component || component.type !== "COMPONENT") {
  return { error: `Component not found: ${COMPONENT_ID}` };
}

const instance = component.createInstance();

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
