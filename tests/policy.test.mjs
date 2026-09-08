import assert from "node:assert/strict";
import { test } from "node:test";
import { deriveRestrictions, normalizeWindowFlag } from "../scripts/policy.mjs";

// Minimal stand-in for Foundry's CONST enums, matching v14.365 Stable values.
const CONST = {
  WALL_SENSE_TYPES: { NONE: 0, NORMAL: 20 },
  WALL_MOVEMENT_TYPES: { NONE: 0, NORMAL: 20 },
};

const PASS = CONST.WALL_SENSE_TYPES.NONE;
const BLOCK = CONST.WALL_SENSE_TYPES.NORMAL;
const MOVE_BLOCK = CONST.WALL_MOVEMENT_TYPES.NORMAL;

test("normalizeWindowFlag falls back to defaults for malformed input", () => {
  assert.deepEqual(normalizeWindowFlag(null), {
    enabled: false,
    schemaVersion: 1,
    material: "glass",
    closedMovement: "blocked",
    maxVaultSize: null,
  });
  assert.deepEqual(normalizeWindowFlag({ material: "wood", closedMovement: "nope" }), {
    enabled: false,
    schemaVersion: 1,
    material: "glass",
    closedMovement: "blocked",
    maxVaultSize: null,
  });
});

test("normalizeWindowFlag only accepts maxVaultSize from the given valid-size list", () => {
  assert.equal(normalizeWindowFlag({ maxVaultSize: "med" }).maxVaultSize, null);
  assert.equal(normalizeWindowFlag({ maxVaultSize: "med" }, ["tiny", "med", "lg"]).maxVaultSize, "med");
  assert.equal(normalizeWindowFlag({ maxVaultSize: "xl" }, ["tiny", "med", "lg"]).maxVaultSize, null);
});

// Required behavior matrix: material x closedMovement x locked -> sight/light/sound/move
// while the window is CLOSED or LOCKED. Movement always blocks in this configuration —
// a window is only ever passable while OPEN; "vaultable" open-passage size-gating is
// enforced separately by vault-guard.mjs, not through this wall-field mapping.
const CASES = [
  { material: "glass", closedMovement: "blocked", locked: false, expect: { sight: PASS, light: PASS, sound: BLOCK, move: MOVE_BLOCK } },
  { material: "glass", closedMovement: "vaultable", locked: false, expect: { sight: PASS, light: PASS, sound: BLOCK, move: MOVE_BLOCK } },
  { material: "opaque", closedMovement: "blocked", locked: false, expect: { sight: BLOCK, light: BLOCK, sound: BLOCK, move: MOVE_BLOCK } },
  { material: "opaque", closedMovement: "vaultable", locked: false, expect: { sight: BLOCK, light: BLOCK, sound: BLOCK, move: MOVE_BLOCK } },
  { material: "glass", closedMovement: "vaultable", locked: true, expect: { sight: PASS, light: PASS, sound: BLOCK, move: MOVE_BLOCK } },
  { material: "opaque", closedMovement: "vaultable", locked: true, expect: { sight: BLOCK, light: BLOCK, sound: BLOCK, move: MOVE_BLOCK } },
  { material: "glass", closedMovement: "blocked", locked: true, expect: { sight: PASS, light: PASS, sound: BLOCK, move: MOVE_BLOCK } },
  { material: "opaque", closedMovement: "blocked", locked: true, expect: { sight: BLOCK, light: BLOCK, sound: BLOCK, move: MOVE_BLOCK } },
];

for (const { material, closedMovement, locked, expect } of CASES) {
  test(`deriveRestrictions: ${material}/${closedMovement}/${locked ? "locked" : "unlocked"}`, () => {
    const flag = normalizeWindowFlag({ enabled: true, material, closedMovement });
    assert.deepEqual(deriveRestrictions(flag, locked, CONST), expect);
  });
}
