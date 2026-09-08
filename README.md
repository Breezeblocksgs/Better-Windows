# Better Windows

<a href="https://www.patreon.com/cw/Breezeblocksgs"><img src="images/buymeacoffee.png" alt="Buy Me a Coffee" width="386"></a>

Tired of every window in Foundry being made of perfectly transparent glass—whether you like it or not? Maybe you tried using doors as windows, only to turn your map into an architectural guessing game: “Is that a door? Is that a window? Can I open it? Why does this house have twelve doors?” If your players are asking more questions about the walls than the adventure, your troubles are over. Better Windows is here!

A Foundry VTT (v14) module that turns ordinary wall segments into interactive **windows** — glass or opaque, openable, lockable, and (optionally) small enough to climb through even while shut.

Better Windows reuses Foundry's native door system under the hood: a window is a real core door (same `ds` open/closed/locked state, same permissions, no custom sockets), rendered with its own icon and configurable independently of every other door on the map.

## Features
![Demo](https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmlreW1ncm16MnFqcm83ZXJsOThic3liY3AxNmY0bXRjZnV4a2kybCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Eciq0ExId6Xt9LWduH/giphy.gif)


- **Draw or convert** — a dedicated Walls-layer tool draws new windows directly, or convert any selection of existing walls into windows in one batch action.
- **Glass or opaque** — glass windows let sight, light, and sound pass while closed; opaque windows block them, just like a wall, until opened.
- **Open / Closed / Locked**, with a distinct icon for each state so players can tell at a glance.
- **Size-limited vaulting** — mark a window "vaultable" and cap the largest creature size (dnd5e size categories) that can climb through it while open. Bigger creatures are blocked even with the window open; everyone is blocked while it's closed or locked.
- **Per-window configuration** — every window gets its own Material and Passage-While-Open settings, right inside the normal Wall Configuration sheet.
- **World settings** — enable/disable the whole module, and set world-wide defaults (material, passage behavior, max vault size) applied to every newly created window.
- **System-independent** — no hard dependency on any game system. The size-based vaulting cap activates automatically when dnd5e is the active system and is simply inert otherwise.

## Installation

In Foundry's **Add-on Modules** tab, use **Install Module** and paste this manifest URL:

```
https://github.com/Breezeblocksgs/Better-Windows/releases/latest/download/module.json
```

Then enable **Better Windows** in your world's module list.

## Usage

**Drawing a window**
Open the Walls layer controls, toggle the *Draw Better Window* tool, and draw a wall segment as usual. It's created as a closed window using your world's default material and passage settings.

**Converting existing walls**
Select one or more walls on the Walls layer, then click *Convert Selected Walls to Better Windows*.

**Configuring a window**
Double-click a window wall to open the normal Wall Configuration sheet — it gains a *Better Window* section with:
- **Treat as Better Window** — toggle the wall's window behavior on/off without losing its other settings.
- **Material** — Glass or Opaque.
- **Passage While Open** — *Anyone can pass* (normal open door) or *Size-limited (Vaultable)*, which reveals a **Max Size to Vault** dropdown.

**Interacting**
Left-click the window icon to open/close it, same as a core door. GMs can right-click to lock/unlock it.

## Module Settings

Found under Foundry's **Configure Settings → Module Settings → Better Windows**:

| Setting | Description |
|---|---|
| Enable Better Window | Turns the entire module on or off. Disabling stops all Better Windows behavior. Requires reloading the application after changing. |
| Default Material | Material applied to every newly drawn or converted window. |
| Default Passage While Open | Passage-while-open behavior applied to every newly drawn or converted window. |
| Default Vault Size | Max Size to Vault applied to every newly drawn or converted window (when vaultable). |

Existing windows are never changed retroactively by these settings — adjust individual windows from their Wall Configuration sheet.

## Compatibility

- **Foundry VTT**: v14 (verified against the current stable build).
- **Game system**: none required. The vaultable size cap uses dnd5e's actor size scale when dnd5e is the active system; on any other system, windows can still be marked vaultable, they simply aren't size-restricted.
- Built on documented, public Foundry APIs (`WallDocument`, `DoorControl`, `CONFIG.Canvas.doorControlClass`, standard hooks) with no socket usage and no monkey-patching, for the best chance of coexisting with other door- or wall-related modules.
- **[Arms Reach](https://foundryvtt.com/packages/arms-reach)**: tested, compatible.

## Credits

Window icons are custom artwork bundled with this module. The Walls-layer tool icon uses the `grid-2x2` glyph from [Lucide](https://lucide.dev), licensed under the ISC License (see `icons/LICENSE-lucide.txt`).

## Support

- Issues and bug reports: [GitHub Issues](https://github.com/Breezeblocksgs/Better-Windows/issues)
- Support the author: [Patreon](https://www.patreon.com/cw/Breezeblocksgs)
