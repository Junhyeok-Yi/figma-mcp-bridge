// Set Prototype Reactions (Navigate to destination)
// Usage: node figma-cli.js tpl set-reactions --sourceId 1:23 --destId 4:56 [--trigger ON_CLICK --transition SMART_ANIMATE --duration 300]

const SOURCE_ID = "{{sourceId}}";
const DEST_ID = "{{destId}}";
const TRIGGER = "{{trigger|ON_CLICK}}";
const TRANSITION = "{{transition|SMART_ANIMATE}}";
const DURATION = {{duration|300}};

const source = await figma.getNodeByIdAsync(SOURCE_ID);
if (!source) return { error: `Source not found: ${SOURCE_ID}` };

const dest = await figma.getNodeByIdAsync(DEST_ID);
if (!dest) return { error: `Destination not found: ${DEST_ID}` };

source.reactions = [
  {
    trigger: { type: TRIGGER },
    actions: [
      {
        type: "NODE",
        destinationId: DEST_ID,
        navigation: "NAVIGATE",
        transition: {
          type: TRANSITION,
          duration: DURATION,
          easing: { type: "EASE_IN_AND_OUT" },
        },
      },
    ],
  },
];

return {
  sourceId: SOURCE_ID,
  destId: DEST_ID,
  trigger: TRIGGER,
  transition: TRANSITION,
};
