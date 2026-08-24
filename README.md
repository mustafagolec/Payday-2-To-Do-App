# a Payday 2 themed to-do app

A desktop to-do list that looks and behaves like the **Crime.net** contract board from
Payday 2. Your tasks are "contracts" pinned to a 2560×1440 city map. The window shows
one part of that map; you reach the rest by grabbing it with the mouse and dragging —
let go and it coasts to a stop.

Each contract opens into a job screen with a checklist, a completion percentage, a due
date, a priority (the risk skulls), and notes.

The faded district names sprawled across the map are yours as well — rename them, add
your own, and drag them wherever you like.

**Windows only.** Interface available in English and Turkish.

<img width="1920" height="1020" alt="CRIME NET 24 08 2026 11_24_24" src="https://github.com/user-attachments/assets/754b2b8a-53dd-4984-8c81-29efbf97168e" />

<img width="1920" height="1020" alt="CRIME NET 24 08 2026 11_24_36" src="https://github.com/user-attachments/assets/ff0f6357-afe7-4004-bca6-3688d4eedadf" />

---

## Part 1 — Install and run

You do not need to know how to program. Follow these five steps in order.

### Step 1 — Install Node.js

Node.js is the tool that turns this source code into a running program. You only ever
install it once.

1. Go to **https://nodejs.org**
2. Download the button that says **LTS** (the recommended one, not "Current")
3. Run the installer and click **Next** through every screen, then **Install**
4. When it finishes, click **Finish**

### Step 2 — Open a terminal in this folder

A "terminal" is a window where you type commands.

1. Open **File Explorer** and go into this project folder (the one containing
   `package.json`)
2. Hold **Shift**, then **right-click** on any empty space inside the folder
3. Choose **"Open PowerShell window here"** (on Windows 11 it may say
   **"Open in Terminal"**)

A black or blue window opens. This is where you type the next commands.

### Step 3 — Check that Node.js is working

Type this and press **Enter**:

```
node -v
```

You should see a version number such as `v22.14.0`.

> **If it says "not recognized":** close the terminal window, open a new one
> (repeat Step 2), and try again. Node.js only becomes available in terminals opened
> *after* you installed it. If it still fails, restart your computer.

### Step 4 — Download the parts this app needs

Type this and press **Enter**:

```
npm install
```

This downloads about 590 MB of building blocks into a `node_modules` folder.
**It takes roughly 1 minute.** You will see a lot of text scroll past — that is normal.
Wait until you get your cursor back.

> **If you see a warning mentioning `electron` or `esbuild` and "install scripts":**
> some newer versions of npm block those on purpose. Run these two commands, one at a
> time, then continue:
>
> ```
> node node_modules/esbuild/install.js
> node node_modules/electron/install.js
> ```

### Step 5 — Build the program

Type this and press **Enter**:

```
npm run dist
```

**This takes about 2 minutes.** When it is done, your program is here:

```
release\CRIME.NET-1.0.2-portable.exe
```

Double-click it and the app opens.

> **If Windows shows a blue "Windows protected your PC" box:** this happens with any
> program that has not been through Microsoft's paid signing process. Click
> **More info**, then **Run anyway**.

### That's it

The `.exe` is portable — no installation, no setup. Copy it to your Desktop, a USB
stick, anywhere you like, and it will still work. Your tasks are not stored next to
the `.exe`, so moving it never loses your data (see *Where your data lives* below).

---

## Part 2 — How to use it

### The map screen

This is the main screen — your whole to-do list, spread across a city.

| What you do | What happens |
|---|---|
| **Hold left mouse button and drag** | Move around the map (it glides to a stop) |
| **Mouse wheel** | Zoom in and out |
| **Click a contract** | Open it |
| **Drag a contract** | Move it to a different spot on the map |
| **Double-click empty space** | Create a new contract right there |
| **Right-click a contract** | Quick menu: start, complete, mark PRO, duplicate, delete |
| **Click the mini-map** (bottom right) | Jump to that area |
| **Drag a group label** | Move it — but only while group dragging is on, see *Groups* below |

Keyboard shortcuts:

| Key | Action |
|---|---|
| `N` | New contract |
| `F` | Filters |
| `L` | Legend (explains the marker colours) |
| `G` | Groups (the labels behind the map) |
| `/` | Jump to the search box |
| `F11` | Fullscreen |

Every marker on the map shows you, from top to bottom: the **list it belongs to**
(or `PRO JOB` in red if it is high priority), the **title**, **progress dots and a
percentage**, and at the bottom **how long you have left** — `2 DAYS LEFT`,
`DUE TODAY`, or `3 DAYS OVERDUE`. Overdue contracts turn red and pulse.

### Groups — the labels behind the map

The big faded words spread across the map — `GEORGETOWN`, `NORTH BAY`, `FOGGY BOTTOM`
and the rest — are **groups**. They are pure labels: nothing is attached to them, and no
contract belongs to one. Use them to carve the map into regions that mean something to
you, then park related contracts inside whichever region fits.

They used to be fixed decoration. Now you can rename, add, delete and move them.

Open the panel with **`[G] GROUPS`** at the top left, or just press **`G`**.

| In the panel | What it does |
|---|---|
| **The text box on each row** | Renames that group. The map updates as you type — there is no save button |
| **◎** | Centres the map on that group, handy when you have lost one |
| **×** | Deletes the group (it asks first) |
| **+ NEW GROUP** | Drops a new group in the middle of whatever you are looking at |
| **ENABLE DRAGGING ON MAP** | The switch described below |

**Moving a group.** Normally the labels ignore the mouse entirely — clicking one just
pans the map, exactly as before. To move them, tick **ENABLE DRAGGING ON MAP**. The
labels brighten to cyan and you can pick any of them up and drag it anywhere. While you
drag, the label turns gold and its row in the panel lights up with it.

Dragging stays on even after you close the panel, so a reminder sits at the bottom of
the screen: **`● GROUP DRAGGING ON — CLICK TO TURN OFF`**. Click it to go back to normal
panning.

Groups are saved along with everything else and travel inside your export/import file.
Delete every one of them and the map simply has no labels — they will not come back on
their own. Save files from earlier versions start with the original six.

### The contract screen

Click any contract to open it. Everything is on one page.

**On the left — your checklist.** Type a task in the box, press **Enter** to add it.
Click the square to tick it off. Click the text to edit it. Click the **×** to delete
it. The bar at the top fills up as you tick things off.

**On the right — the details:**

- **DUE DATE** — pick a date; the countdown then appears on the map
- **STATUS** — pending / in progress / completed
- **PAYOUT** — what this task is worth to you (use it however you like)
- **TAGS** — comma separated, searchable
- **PRO JOB** — tick this to mark it high priority (turns the marker red)
- **NOTES** — free text
- **CREW / LIST** — which list this belongs to; type a name and press **+** to create
  a new one
- **DELETE CONTRACT** — removes it permanently

**At the top right — the skulls.** Click a skull to set the priority, 1 to 6, exactly
like Payday 2's difficulty. Higher priority glows brighter.

**At the bottom right — READY.** Click it to mark the whole contract completed. Click
again to undo.

Press **ESC** to go back to the map.

### Settings

Click **SETTINGS** in the title bar at the top.

- **Language** — English or Turkish
- **Ripple effect** — the water-drop ripple that pulses out of contracts on the map,
  like the Crime.net screen in the game. Turn it on or off.

### If you know Payday 2, here is the translation

| Payday 2 | This app |
|---|---|
| Contract | A task |
| Player name (blue text) | Crew / list — your category (`work`, `home`, `study`…) |
| PRO JOB (red) | High priority |
| Risk skulls | Priority level, 1–6 |
| Preplanning asset | An item in the checklist |
| READY | Mark the task completed |
| Payout ($) | What the task is worth to you |
| District names on the map | Groups — rename them to anything you like |

---

## Where your data lives

Everything you type is saved automatically, 0.4 seconds after you stop typing. You
never have to press save.

```
%APPDATA%\CRIME.NET\crimenet-data.json       your contracts
%APPDATA%\CRIME.NET\crimenet-data.bak.json   a backup of the previous version
```

Paste `%APPDATA%\CRIME.NET` into File Explorer's address bar to open that folder.

The app writes to a temporary file first and then swaps it into place, so even a crash
mid-save leaves you with an intact copy. If a save file is ever unreadable, the app
starts with an empty board instead of hanging.

Use the **FILE** menu in the title bar to export your data as JSON, import it back,
open the folder, or reset everything to the sample contracts.

---

## Version history

| Version | Release | What changed |
|---|---|---|
| **1.0.2** | Group Editing | The district labels became **groups** — rename, add, delete and drag them into place. Dragging sits behind a switch, so ordinary panning is untouched. |
| **1.0.1** | New Task & Filters & Language Detection | The new-contract screen, the filter panel (status, list, minimum risk, PRO only), and interface language picked up from Windows automatically. |
| **1.0.0** | First build | Map, contracts, checklists, due dates, priorities, lists, export and import. |

The version lives in `package.json`. Change it there and the next `npm run dist` names
the output to match — `release\CRIME.NET-1.0.2-portable.exe`.

---

## Part 3 — For developers

### Commands

```
npm install      install dependencies (once)
npm run dev      Vite + Electron with hot reload
npm start        build, then open in Electron
npm run dist     produce release\CRIME.NET-1.0.2-portable.exe
```

`release/`, `dist/` and `build/` are generated output. They are not in the repository —
the commands above recreate them from scratch.

### Layout

```
electron/main.cjs        main process: window, IPC, saving to disk
electron/preload.cjs     secure bridge (contextIsolation enabled)
src/App.jsx              state, autosave, keyboard shortcuts
src/store.js             data model, normalisation/migration, sample data
src/i18n.js              English and Turkish strings
src/components/
  CrimeNet.jsx           map screen: momentum panning, zoom, HUD, filters, minimap, ripples
  CityMap.jsx            procedural city map, fixed seed, square grid (SVG); draws the group labels
  ContractMarker.jsx     a single map marker
  JobScreen.jsx          single-page contract screen
  SettingsScreen.jsx     language and ripple settings
  TitleBar.jsx           frameless window title bar + file menu
scripts/make-icon.cjs    generates build/icon.ico (dependency-free PNG/ICO encoder)
scripts/run-electron.cjs launches Electron with a clean environment
```

The map looks identical on every launch: `CityMap.jsx` uses a fixed-seed PRNG
(`mulberry32(20131113)` — Payday 2's release date). Main grid is 160 px squares,
sub-grid 40 px.

Old save files migrate automatically inside `normalize()`: the v1 `days[].assets`
structure is flattened into a plain `items` list, and saves written before v4 — which
had no groups at all — are given the original six district labels. An empty `groups`
array is left empty, so deleting them all is a decision the app respects.

### Known environment issues

**`npm run dist` fails with "Cannot create symbolic link".**
electron-builder's `winCodeSign` package contains macOS symlinks, and creating those on
Windows requires administrator rights. Extract the archive manually, skipping that
folder:

```powershell
$c = "$env:LOCALAPPDATA\electron-builder\Cache\winCodeSign"
Get-ChildItem $c -Directory | Remove-Item -Recurse -Force
& ".\node_modules\7zip-bin\win\x64\7za.exe" x "$c\<downloaded>.7z" "-o$c\winCodeSign-2.6.0" "-xr!darwin" -y
```

Also close the app before packaging — a running instance locks the `.exe` inside
`release\` and the build will hang.

**App won't start: `Cannot read properties of undefined (reading 'whenReady')`.**
VS Code's integrated terminal leaves `ELECTRON_RUN_AS_NODE=1` set, which makes Electron
boot as plain Node. `main.cjs` detects this and relaunches itself with a clean
environment; if that still fails, use a normal PowerShell window.
