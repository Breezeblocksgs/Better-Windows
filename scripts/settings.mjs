import { MODULE_ID } from "./repository.mjs";
import { MATERIALS, CLOSED_MOVEMENTS } from "./policy.mjs";
import { getSizeOptions } from "./size-adapter.mjs";

const SETTINGS = {
  enabled: "enabled",
  defaultVaultSize: "defaultVaultSize",
  defaultMaterial: "defaultMaterial",
  defaultClosedMovement: "defaultClosedMovement",
};

/** Register the module's Settings-menu entries. Call once, first thing in init. */
export function registerSettings() {
  game.settings.register(MODULE_ID, SETTINGS.enabled, {
    name: "BETTER_WINDOWS.Settings.Enabled.Name",
    hint: "BETTER_WINDOWS.Settings.Enabled.Hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    requiresReload: true,
  });

  game.settings.register(MODULE_ID, SETTINGS.defaultVaultSize, {
    name: "BETTER_WINDOWS.Settings.DefaultVaultSize.Name",
    hint: "BETTER_WINDOWS.Settings.DefaultVaultSize.Hint",
    scope: "world",
    config: true,
    type: String,
    choices: Object.fromEntries(getSizeOptions().map(({ key, label }) => [key, label])),
    default: "med",
  });

  game.settings.register(MODULE_ID, SETTINGS.defaultMaterial, {
    name: "BETTER_WINDOWS.Settings.DefaultMaterial.Name",
    hint: "BETTER_WINDOWS.Settings.DefaultMaterial.Hint",
    scope: "world",
    config: true,
    type: String,
    choices: {
      glass: "BETTER_WINDOWS.Config.MaterialGlass",
      opaque: "BETTER_WINDOWS.Config.MaterialOpaque",
    },
    default: MATERIALS[0], // "glass"
  });

  game.settings.register(MODULE_ID, SETTINGS.defaultClosedMovement, {
    name: "BETTER_WINDOWS.Settings.DefaultClosedMovement.Name",
    hint: "BETTER_WINDOWS.Settings.DefaultClosedMovement.Hint",
    scope: "world",
    config: true,
    type: String,
    choices: {
      blocked: "BETTER_WINDOWS.Config.ClosedMovementBlocked",
      vaultable: "BETTER_WINDOWS.Config.ClosedMovementVaultable",
    },
    default: CLOSED_MOVEMENTS[0], // "blocked"
  });
}

export function isModuleEnabled() {
  return game.settings.get(MODULE_ID, SETTINGS.enabled);
}

export function getDefaultVaultSize() {
  return game.settings.get(MODULE_ID, SETTINGS.defaultVaultSize);
}

export function getDefaultMaterial() {
  return game.settings.get(MODULE_ID, SETTINGS.defaultMaterial);
}

export function getDefaultClosedMovement() {
  return game.settings.get(MODULE_ID, SETTINGS.defaultClosedMovement);
}

/** The flag patch to stamp on a freshly drawn or converted window. */
export function getDefaultWindowFlagPatch() {
  return {
    enabled: true,
    material: getDefaultMaterial(),
    closedMovement: getDefaultClosedMovement(),
    maxVaultSize: getDefaultVaultSize(),
  };
}
