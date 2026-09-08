/**
 * Small, feature-detected adapter onto dnd5e's actor size scale. Never a hard
 * dependency: every export degrades to "no size gating" when dnd5e isn't the
 * active system, per the system-independence invariant.
 */

// Canonical dnd5e size-key order, used only as a fallback if CONFIG.DND5E.actorSizes
// isn't present in the expected shape (verify against the installed dnd5e version).
const FALLBACK_SIZE_ORDER = ["tiny", "sm", "med", "lg", "huge", "grg"];

export function isDnd5e() {
  return game.system.id === "dnd5e";
}

/** Ordered list of {key, label} for every size dnd5e defines, smallest first. */
export function getSizeOptions() {
  const configured = CONFIG.DND5E?.actorSizes;
  if (configured && typeof configured === "object") {
    return Object.entries(configured).map(([key, value]) => ({
      key,
      label: value?.label ?? value ?? key,
    }));
  }
  return FALLBACK_SIZE_ORDER.map((key) => ({ key, label: key }));
}

function getSizeOrder() {
  return getSizeOptions().map((option) => option.key);
}

/** Rank of a size key (higher = bigger), or null if unrecognized. */
export function getSizeRank(sizeKey) {
  const rank = getSizeOrder().indexOf(sizeKey);
  return rank === -1 ? null : rank;
}

/** The dnd5e size key for a token's actor, or null if unavailable/not dnd5e. */
export function getTokenSizeKey(tokenDocument) {
  if (!isDnd5e()) return null;
  return tokenDocument?.actor?.system?.traits?.size ?? null;
}
