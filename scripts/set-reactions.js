// Set Prototype Reactions (Navigate to destination)
// Usage: node figma-cli.js run scripts/set-reactions.js
// Edit SOURCE_ID and DEST_ID before running.

const SOURCE_ID = "REPLACE_ME";
const DEST_ID = "REPLACE_ME";
const TRIGGER = "ON_CLICK";
const TRANSITION = "SMART_ANIMATE";
const DURATION = 300;

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
