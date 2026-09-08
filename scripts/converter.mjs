import { MODULE_ID, buildWallUpdate } from "./repository.mjs";
import { getDefaultWindowFlagPatch } from "./settings.mjs";

/**
 * Convert every currently-selected wall on the active scene into a Better
 * Window, in a single batched embedded-document update. No-op + a localized
 * notice when nothing is selected. Never touches unselected walls, and only
 * writes the door/restriction/flag fields it owns.
 */
export async function convertSelectedWalls() {
  const walls = canvas.walls?.controlled ?? [];
  if (walls.length === 0) {
    ui.notifications.info(game.i18n.localize("BETTER_WINDOWS.Notifications.NoWallsSelected"));
    return;
  }

  const updates = walls.map((wall) => ({
    _id: wall.document.id,
    ...buildWallUpdate(getDefaultWindowFlagPatch()),
  }));

  await canvas.scene.updateEmbeddedDocuments("Wall", updates);
  ui.notifications.info(
    game.i18n.format("BETTER_WINDOWS.Notifications.ConvertedWalls", { count: updates.length })
  );
}

export function registerConvertControlButton(controls) {
  const walls = controls.walls;
  if (!walls || !game.user.isGM) return;

  walls.tools[`${MODULE_ID}-convert`] = {
    name: `${MODULE_ID}-convert`,
    order: Object.keys(walls.tools).length,
    title: "BETTER_WINDOWS.Controls.ConvertSelected",
    icon: "fa-solid fa-arrows-rotate",
    button: true,
    onChange: () => convertSelectedWalls(),
  };
}
