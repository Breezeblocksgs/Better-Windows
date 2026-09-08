import { MODULE_ID, getWindowFlag } from "./repository.mjs";
import { DEFAULT_WINDOW_FLAG, deriveRestrictions, normalizeWindowFlag } from "./policy.mjs";
import { getSizeOptions } from "./size-adapter.mjs";
import { getDefaultVaultSize, getDefaultWindowFlagPatch } from "./settings.mjs";

const FIELDSET_CLASS = `${MODULE_ID}-fieldset`;

/**
 * Inject the Better Window fieldset into WallConfig's rendered form. Inputs
 * use dotted flag-path `name` attributes so Foundry's generic ApplicationV2
 * form-to-update conversion (FormDataExtended) picks them up on submit
 * without needing to override any protected WallConfig submit method.
 */
export function onRenderWallConfig(app, html) {
  const root = html instanceof HTMLElement ? html : html[0];
  const existing = root.querySelector(`.${FIELDSET_CLASS}`);
  if (existing) existing.remove();

  const form = root.querySelector("form") ?? root;
  const flag = getWindowFlag(app.document) ?? { ...getDefaultWindowFlagPatch(), enabled: false };

  const fieldset = document.createElement("fieldset");
  fieldset.classList.add(FIELDSET_CLASS);
  fieldset.innerHTML = `
    <legend>${game.i18n.localize("BETTER_WINDOWS.Config.Legend")}</legend>
    <label>
      <input type="checkbox" name="flags.${MODULE_ID}.window.enabled" ${flag.enabled ? "checked" : ""}>
      ${game.i18n.localize("BETTER_WINDOWS.Config.Enabled")}
    </label>
    <div class="form-group">
      <label>${game.i18n.localize("BETTER_WINDOWS.Config.Material")}</label>
      <select name="flags.${MODULE_ID}.window.material">
        <option value="glass" ${flag.material === "glass" ? "selected" : ""}>${game.i18n.localize("BETTER_WINDOWS.Config.MaterialGlass")}</option>
        <option value="opaque" ${flag.material === "opaque" ? "selected" : ""}>${game.i18n.localize("BETTER_WINDOWS.Config.MaterialOpaque")}</option>
      </select>
    </div>
    <div class="form-group">
      <label>${game.i18n.localize("BETTER_WINDOWS.Config.ClosedMovement")}</label>
      <label>
        <input type="radio" name="flags.${MODULE_ID}.window.closedMovement" value="blocked" ${flag.closedMovement === "blocked" ? "checked" : ""}>
        ${game.i18n.localize("BETTER_WINDOWS.Config.ClosedMovementBlocked")}
      </label>
      <label>
        <input type="radio" name="flags.${MODULE_ID}.window.closedMovement" value="vaultable" ${flag.closedMovement === "vaultable" ? "checked" : ""}>
        ${game.i18n.localize("BETTER_WINDOWS.Config.ClosedMovementVaultable")}
      </label>
      <p class="hint">${game.i18n.localize("BETTER_WINDOWS.Config.ClosedMovementHint")}</p>
    </div>
    <div class="form-group ${FIELDSET_CLASS}-max-vault-size">
      <label>${game.i18n.localize("BETTER_WINDOWS.Config.MaxVaultSize")}</label>
      <select name="flags.${MODULE_ID}.window.maxVaultSize">
        ${getSizeOptions().map(({ key, label }) => `<option value="${key}" ${(flag.maxVaultSize ?? getDefaultVaultSize()) === key ? "selected" : ""}>${label}</option>`).join("")}
      </select>
      <p class="hint">${game.i18n.localize("BETTER_WINDOWS.Config.MaxVaultSizeHint")}</p>
    </div>
    <input type="hidden" name="flags.${MODULE_ID}.window.schemaVersion" value="${DEFAULT_WINDOW_FLAG.schemaVersion}">
    <input type="hidden" name="door" class="${FIELDSET_CLASS}-door">
    <input type="hidden" name="sight" class="${FIELDSET_CLASS}-sight">
    <input type="hidden" name="light" class="${FIELDSET_CLASS}-light">
    <input type="hidden" name="sound" class="${FIELDSET_CLASS}-sound">
    <input type="hidden" name="move" class="${FIELDSET_CLASS}-move">
  `;

  form.appendChild(fieldset);

  // Runtime-verify: core WallConfig's own door/sight/light/sound/move inputs must be
  // hidden/removed here (or these duplicate `name`s will collide with them) — confirm
  // in a disposable v14 world during the batch 2 gate.
  form.querySelectorAll('[name="door"], [name="sight"], [name="light"], [name="sound"], [name="move"]').forEach((el) => {
    const isOurs = [...el.classList].some((c) => c.startsWith(FIELDSET_CLASS));
    if (!isOurs) el.closest(".form-group")?.remove();
  });

  const isLocked = app.document.ds === CONST.WALL_DOOR_STATES.LOCKED;
  const maxVaultSizeGroup = fieldset.querySelector(`.${FIELDSET_CLASS}-max-vault-size`);
  const recompute = () => {
    const closedMovement = fieldset.querySelector(`[name$="window.closedMovement"]:checked`)?.value;
    if (maxVaultSizeGroup) maxVaultSizeGroup.hidden = closedMovement !== "vaultable";

    const enabled = fieldset.querySelector(`[name$="window.enabled"]`).checked;
    if (!enabled) return; // leave door/restriction fields untouched when disabling
    const material = fieldset.querySelector(`[name$="window.material"]`).value;
    const restrictions = deriveRestrictions(normalizeWindowFlag({ material, closedMovement }), isLocked, CONST);
    fieldset.querySelector(`.${FIELDSET_CLASS}-door`).value = CONST.WALL_DOOR_TYPES.DOOR;
    fieldset.querySelector(`.${FIELDSET_CLASS}-sight`).value = restrictions.sight;
    fieldset.querySelector(`.${FIELDSET_CLASS}-light`).value = restrictions.light;
    fieldset.querySelector(`.${FIELDSET_CLASS}-sound`).value = restrictions.sound;
    fieldset.querySelector(`.${FIELDSET_CLASS}-move`).value = restrictions.move;
  };

  fieldset.addEventListener("change", recompute);
  recompute();
}
