import { getWindowFlag } from "./repository.mjs";
import { getSizeRank, getTokenSizeKey, isDnd5e } from "./size-adapter.mjs";

/**
 * A window is only ever passable while OPEN — closed/locked always block at
 * the wall level (policy.mjs). But Foundry's native open-door handling
 * bypasses ALL restriction fields once ds === OPEN, and Wall has no
 * per-token-size field to begin with, so a "vaultable" open window's size
 * cap has to be enforced here, at the movement-update boundary: no path
 * animation or partial-step handling, just accept/reject the whole move,
 * matching the contract's "plain collision behavior" bar.
 */
export function registerVaultGuard() {
  Hooks.on("preUpdateToken", onPreUpdateToken);
}

function onPreUpdateToken(tokenDocument, changes) {
  if (!isDnd5e()) return true; // no size adapter for this system: no gating
  if (changes.x === undefined && changes.y === undefined) return true;

  const sizeKey = getTokenSizeKey(tokenDocument);
  const tokenRank = getSizeRank(sizeKey);
  if (tokenRank === null) return true; // unknown/missing size data: don't guess, allow

  // Measure from document fields, not the live placeable: Foundry previews drag
  // movement on the canvas object before preUpdateToken fires, so `object.center`
  // is often already at (or near) the destination by the time this hook runs.
  const grid = tokenDocument.parent?.grid ?? canvas.grid;
  const halfWidth = (tokenDocument.width * grid.size) / 2;
  const halfHeight = (tokenDocument.height * grid.size) / 2;
  const origin = { x: tokenDocument.x + halfWidth, y: tokenDocument.y + halfHeight };
  const destination = {
    x: (changes.x ?? tokenDocument.x) + halfWidth,
    y: (changes.y ?? tokenDocument.y) + halfHeight,
  };

  const blockingWall = findBlockingVaultWall(tokenDocument.parent, origin, destination, tokenRank);
  if (!blockingWall) return true;

  ui.notifications.warn(game.i18n.localize("BETTER_WINDOWS.Notifications.TooLargeToVault"));
  return false;
}

function findBlockingVaultWall(scene, origin, destination, tokenRank) {
  for (const wall of scene?.walls ?? []) {
    if (wall.door !== CONST.WALL_DOOR_TYPES.DOOR) continue;
    if (wall.ds !== CONST.WALL_DOOR_STATES.OPEN) continue; // closed/locked already block everyone natively

    const flag = getWindowFlag(wall);
    if (!flag || flag.closedMovement !== "vaultable" || !flag.maxVaultSize) continue;

    const capRank = getSizeRank(flag.maxVaultSize);
    if (capRank === null || tokenRank <= capRank) continue;

    const [x1, y1, x2, y2] = wall.c;
    if (foundry.utils.lineSegmentIntersects(origin, destination, { x: x1, y: y1 }, { x: x2, y: y2 })) {
      return wall;
    }
  }
  return null;
}
