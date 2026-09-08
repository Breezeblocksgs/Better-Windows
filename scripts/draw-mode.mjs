import { MODULE_ID, buildWallUpdate } from "./repository.mjs";
import { getDefaultWindowFlagPatch } from "./settings.mjs";

const ICON_PATH = `modules/${MODULE_ID}/icons/grid-2x2.svg`;

/** Local, module-scoped toggle. Never a world setting (contract: local to the initiating GM only). */
let drawModeActive = false;

export function isDrawModeActive() {
  return drawModeActive;
}

function setDrawModeActive(active) {
  drawModeActive = active;
}

/** Reset on canvas teardown / control-group change so the mode never leaks. */
export function resetDrawMode() {
  drawModeActive = false;
}

export function registerSceneControlButton(controls) {
  const walls = controls.walls;
  if (!walls || !game.user.isGM) return;

  walls.tools[`${MODULE_ID}-draw`] = {
    name: `${MODULE_ID}-draw`,
    order: Object.keys(walls.tools).length,
    title: "BETTER_WINDOWS.Controls.DrawWindow",
    icon: `${MODULE_ID}-tool-icon`,
    toggle: true,
    active: drawModeActive,
    onChange: (_event, active) => setDrawModeActive(active),
  };
}

/**
 * Foundry inserts a scene-control tool's `icon` string as a class on some
 * element inside its button, but the exact wrapper/tag isn't documented and
 * a guessed CSS selector didn't render anything. Sidestep the guesswork
 * entirely: find the button by its `data-tool` attribute (a long-stable
 * Foundry convention) and inject our own <img> directly, the same proven
 * approach already used for the WallConfig fieldset.
 */
export function onRenderSceneControls(_app, html) {
  const root = html instanceof HTMLElement ? html : html[0];
  const button = root?.querySelector('[data-tool="better-windows-draw"]');
  if (!button) return;
  if (button.querySelector(`img.${MODULE_ID}-tool-icon`)) return; // already injected

  const img = document.createElement("img");
  img.src = ICON_PATH;
  img.classList.add(`${MODULE_ID}-tool-icon`);

  const placeholder = button.querySelector("i, img");
  if (placeholder) placeholder.replaceWith(img);
  else button.prepend(img);
}

/**
 * Stamp default window flags + core door fields onto a freshly-drawn Wall,
 * but only for a wall this client is actively drawing while in draw mode.
 * Never post-update walls created by cloning, import, or bulk operations.
 */
export function onPreCreateWall(document, data, options, userId) {
  if (!drawModeActive) return;
  if (userId !== game.user.id || !game.user.isGM) return;
  if (options.isUndo || options.fromCompendium) return;

  document.updateSource(buildWallUpdate(getDefaultWindowFlagPatch()));
}

export const drawModeIconPath = ICON_PATH;
