import { MODULE_ID, buildWallUpdate, getWindowFlag } from "./repository.mjs";
import { getCachedWindowIconTexture } from "./icon-assets.mjs";

let ParentDoorControl = null;
let OurDoorControl = null;
let warnedAboutReplacement = false;

/**
 * Capture whatever is currently registered in CONFIG.Canvas.doorControlClass
 * (never assume the unmodified core class — another module may have already
 * subclassed it) and register our subclass back in its place. Call once,
 * during init, before canvas door controls are constructed.
 */
export function registerDoorControlClass() {
  ParentDoorControl = CONFIG.Canvas.doorControlClass;

  class BetterWindowsDoorControl extends ParentDoorControl {
    get _windowFlag() {
      return getWindowFlag(this.wall.document);
    }

    get _windowVisualState() {
      const ds = this.wall.document.ds;
      if (ds === CONST.WALL_DOOR_STATES.LOCKED) return "locked";
      if (ds === CONST.WALL_DOOR_STATES.OPEN) return "open";
      return "closed";
    }

    _getTexture() {
      const flag = this._windowFlag;
      if (!flag) return super._getTexture();
      const state = this._windowVisualState;
      // Cached texture resolves synchronously after canvasReady warms it; before that,
      // fall back to the parent's texture for one frame rather than blocking render.
      return getCachedWindowIconTexture(state) ?? super._getTexture();
    }

    _onMouseOver(event) {
      const result = super._onMouseOver(event);
      const flag = this._windowFlag;
      if (flag) this._showWindowTooltip();
      return result;
    }

    _onMouseOut(event) {
      const result = super._onMouseOut(event);
      this._hideWindowTooltip();
      return result;
    }

    /** Minimal PIXI-rendered hover label; core DoorControl exposes no documented tooltip hook to extend. */
    _showWindowTooltip() {
      this._hideWindowTooltip();
      const key = `BETTER_WINDOWS.DoorControl.${this._windowVisualState.charAt(0).toUpperCase()}${this._windowVisualState.slice(1)}`;
      const text = new PIXI.Text(game.i18n.localize(key), {
        fontSize: 14,
        fill: 0xffffff,
        stroke: 0x000000,
        strokeThickness: 4,
      });
      text.anchor.set(0.5, 1);
      text.position.set(this.width / 2, -4);
      this._windowTooltip = this.addChild(text);
    }

    _hideWindowTooltip() {
      this._windowTooltip?.destroy();
      this._windowTooltip = null;
    }

    async _onRightDown(event) {
      const flag = this._windowFlag;
      if (!flag) return super._onRightDown(event);
      if (!game.user.isGM) return; // locking stays GM-only, same as core doors

      const wall = this.wall.document;
      const isLocked = wall.ds === CONST.WALL_DOOR_STATES.LOCKED;
      const nextState = isLocked ? CONST.WALL_DOOR_STATES.CLOSED : CONST.WALL_DOOR_STATES.LOCKED;
      const willBeLocked = nextState === CONST.WALL_DOOR_STATES.LOCKED;

      // Single update: lock/unlock and the movement restriction that follows
      // from it land atomically, never as two separate writes.
      await wall.update({ ...buildWallUpdate(flag, { isLocked: willBeLocked }), ds: nextState });
    }
  }

  OurDoorControl = BetterWindowsDoorControl;
  CONFIG.Canvas.doorControlClass = BetterWindowsDoorControl;
}

/** Warn once if another module replaces our registered class after us (never fight over the slot). */
export function checkDoorControlClassOwnership() {
  if (warnedAboutReplacement || !OurDoorControl) return;
  if (CONFIG.Canvas.doorControlClass === OurDoorControl) return;

  console.warn(
    `${MODULE_ID} | CONFIG.Canvas.doorControlClass was replaced by another module after registration. Better Window icons/state may not render correctly.`
  );
  warnedAboutReplacement = true;
}

/**
 * Force every window's door-control icon to redraw. Door controls draw once
 * as walls are placed on the canvas, which can race the async icon texture
 * load — without this, a window keeps the fallback core door icon until a
 * player clicks it (which triggers its own redraw). Call once the icon
 * textures are confirmed warmed (see icon-assets.mjs), on every canvasReady.
 */
export function refreshWindowDoorControls() {
  for (const wall of canvas.walls?.placeables ?? []) {
    if (wall.doorControl && getWindowFlag(wall.document)) wall.doorControl.draw();
  }
}
