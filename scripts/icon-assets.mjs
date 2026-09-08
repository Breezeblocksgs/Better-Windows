import { MODULE_ID } from "./repository.mjs";

const ICON_PATHS = {
  closed: `modules/${MODULE_ID}/icons/window-closed.png`,
  open: `modules/${MODULE_ID}/icons/window-open.png`,
  locked: `modules/${MODULE_ID}/icons/window-locked.png`,
};

const cachedTextures = { closed: null, open: null, locked: null };

/** Load (or return cached) texture for one window visual state: "closed" | "open" | "locked". */
export async function getWindowIconTexture(state = "closed") {
  cachedTextures[state] ??= await loadTexture(ICON_PATHS[state]);
  return cachedTextures[state];
}

/** Warm all three state textures at once (call from a canvasReady hook, never at import time). */
export async function warmWindowIconTextures() {
  await Promise.all(Object.keys(ICON_PATHS).map((state) => getWindowIconTexture(state)));
}

/** Synchronous read of whatever is currently cached for a state (null until warmed). */
export function getCachedWindowIconTexture(state = "closed") {
  return cachedTextures[state];
}
