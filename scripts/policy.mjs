/**
 * Pure mapping from Better Windows flag state to core Wall restriction fields.
 * No Foundry globals besides CONST — safe to unit test under plain Node.
 */

export const MATERIALS = /** @type {const} */ (["glass", "opaque"]);
export const CLOSED_MOVEMENTS = /** @type {const} */ (["blocked", "vaultable"]);

export const DEFAULT_WINDOW_FLAG = Object.freeze({
  enabled: true,
  schemaVersion: 1,
  material: "glass",
  // Governs passage while the window is OPEN (closed/locked always block movement
  // at the wall level, below). "blocked" = open window behaves like a normal open
  // door, anyone passes. "vaultable" = passage through the open window is size-gated.
  closedMovement: "blocked",
  // Largest token size (system-defined key, e.g. dnd5e's "med") allowed to pass
  // through the OPEN window. null = no cap, anyone can pass — the only meaningful
  // value for systems without a size-adapter. Ignored unless closedMovement is "vaultable".
  maxVaultSize: null,
});

/**
 * Normalize an arbitrary flag payload to a valid window flag, falling back to
 * defaults for missing or unrecognized values instead of throwing.
 * @param {unknown} raw
 * @param {readonly string[]} [validSizeKeys] - system-provided valid size keys, if any
 */
export function normalizeWindowFlag(raw, validSizeKeys) {
  const source = raw && typeof raw === "object" ? raw : {};
  const material = MATERIALS.includes(source.material) ? source.material : DEFAULT_WINDOW_FLAG.material;
  const closedMovement = CLOSED_MOVEMENTS.includes(source.closedMovement)
    ? source.closedMovement
    : DEFAULT_WINDOW_FLAG.closedMovement;
  const maxVaultSize = validSizeKeys?.includes(source.maxVaultSize) ? source.maxVaultSize : null;
  return {
    enabled: source.enabled === true,
    schemaVersion: DEFAULT_WINDOW_FLAG.schemaVersion,
    material,
    closedMovement,
    maxVaultSize,
  };
}

/**
 * Derive the core Wall restriction fields (sight/light/sound/move) that apply
 * while the door is closed or locked. Foundry's native door-state handling
 * (ds === OPEN) already bypasses these restrictions when the window is open,
 * so this function only needs to describe the closed/locked configuration —
 * movement always blocks while closed or locked; a window is only ever
 * passable while OPEN, and "vaultable" size-gating on open passage is
 * enforced separately (vault-guard.mjs), since Wall has no per-token field.
 * @param {{material: "glass"|"opaque"}} flag
 * @param {boolean} isLocked - unused; kept for call-site symmetry with the pre-open-gating design
 * @param {typeof CONST} constants - injected so this stays testable without Foundry loaded
 */
export function deriveRestrictions(flag, isLocked, constants) {
  const { WALL_SENSE_TYPES, WALL_MOVEMENT_TYPES } = constants;
  const seesThrough = flag.material === "glass";
  const sightLight = seesThrough ? WALL_SENSE_TYPES.NONE : WALL_SENSE_TYPES.NORMAL;

  return {
    sight: sightLight,
    light: sightLight,
    sound: WALL_SENSE_TYPES.NORMAL,
    move: WALL_MOVEMENT_TYPES.NORMAL,
  };
}
