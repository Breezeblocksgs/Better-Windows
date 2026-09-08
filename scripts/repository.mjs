import { deriveRestrictions, normalizeWindowFlag } from "./policy.mjs";
import { getSizeOptions } from "./size-adapter.mjs";

export const MODULE_ID = "better-windows";
export const FLAG_KEY = "window";

function validSizeKeys() {
  return getSizeOptions().map((option) => option.key);
}

/**
 * Read and normalize the Better Windows flag from a Wall document (or a
 * plain wall-data object during creation, before the Document exists yet).
 * @param {{ flags?: object, getFlag?: (scope: string, key: string) => unknown }} wall
 */
export function getWindowFlag(wall) {
  const raw = typeof wall.getFlag === "function"
    ? wall.getFlag(MODULE_ID, FLAG_KEY)
    : wall.flags?.[MODULE_ID]?.[FLAG_KEY];
  return raw && raw.enabled === true ? normalizeWindowFlag(raw, validSizeKeys()) : null;
}

/**
 * Build a single Wall update payload for a given window flag patch and lock
 * state. Callers (draw mode, converter, WallConfig, DoorControl) all route
 * through this so restriction fields are never computed ad hoc.
 * @param {Partial<import("./policy.mjs").DEFAULT_WINDOW_FLAG> & {enabled: boolean}} flagPatch
 * @param {{ isLocked?: boolean, doorState?: number }} options
 */
export function buildWallUpdate(flagPatch, { isLocked = false } = {}) {
  const constants = globalThis.CONST;
  const flag = normalizeWindowFlag(flagPatch, validSizeKeys());

  if (!flagPatch.enabled) {
    return { [`flags.${MODULE_ID}.-=${FLAG_KEY}`]: null };
  }

  const restrictions = deriveRestrictions(flag, isLocked, constants);
  return {
    door: constants.WALL_DOOR_TYPES.DOOR,
    ...restrictions,
    [`flags.${MODULE_ID}.${FLAG_KEY}`]: flag,
  };
}

/**
 * Apply a window flag patch to a live Wall document in one update call.
 * @param {import("foundry.documents").WallDocument} wall
 * @param {Partial<import("./policy.mjs").DEFAULT_WINDOW_FLAG> & {enabled: boolean}} flagPatch
 * @param {{ isLocked?: boolean }} [options]
 */
export function applyWindowFlag(wall, flagPatch, options) {
  return wall.update(buildWallUpdate(flagPatch, options));
}
