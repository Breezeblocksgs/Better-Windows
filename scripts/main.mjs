import { MODULE_ID } from "./repository.mjs";
import { checkDoorControlClassOwnership, refreshWindowDoorControls, registerDoorControlClass } from "./door-control.mjs";
import { registerConvertControlButton } from "./converter.mjs";
import { onPreCreateWall, registerSceneControlButton, resetDrawMode } from "./draw-mode.mjs";
import { onRenderWallConfig } from "./wall-config.mjs";
import { warmWindowIconTextures } from "./icon-assets.mjs";
import { registerVaultGuard } from "./vault-guard.mjs";
import { isModuleEnabled, registerSettings } from "./settings.mjs";

Hooks.once("init", () => {
  registerSettings();

  if (!isModuleEnabled()) {
    console.info(`${MODULE_ID} | Disabled via settings; nothing else will be registered.`);
    return;
  }

  console.info(`${MODULE_ID} | Initializing`);
  registerDoorControlClass();
  registerVaultGuard();

  Hooks.on("getSceneControlButtons", (controls) => {
    registerSceneControlButton(controls);
    registerConvertControlButton(controls);
  });

  Hooks.on("preCreateWall", onPreCreateWall);
  Hooks.on("renderWallConfig", onRenderWallConfig);

  Hooks.on("canvasInit", () => {
    resetDrawMode();
    checkDoorControlClassOwnership();
  });

  Hooks.on("canvasReady", () => {
    // Canvas assets are guaranteed loadable by now; door controls may already have
    // drawn with the fallback core icon before this resolves, so force a redraw.
    warmWindowIconTextures().then(refreshWindowDoorControls);
  });

  Hooks.on("canvasTeardown", resetDrawMode);
});
