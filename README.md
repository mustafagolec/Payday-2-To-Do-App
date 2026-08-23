# CRIME.NET — a Payday 2 themed to-do app

A desktop to-do list that looks and behaves like the **Crime.net** contract board from
Payday 2. Your tasks are "contracts" pinned to a 2560×1440 city map. The window shows
one part of that map; you reach the rest by grabbing it with the mouse and dragging —
let go and it coasts to a stop.

Each contract opens into a job screen with a checklist, a completion percentage, a due
date, a priority (the risk skulls), and notes.

**Windows only.** Interface available in English and Turkish.

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
release\CRIME.NET-1.0.0-portable.exe
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

Keyboard shortcuts:

| Key | Action |
|---|---|
| `N` | New contract |
| `F` | Filters |
| `L` | Legend (explains the marker colours) |
| `/` | Jump to the search box |
| `F11` | Fullscreen |

Every marker on the map shows you, from top to bottom: the **list it belongs to**
(or `PRO JOB` in red if it is high priority), the **title**, **progress dots and a
percentage**, and at the bottom **how long you have left** — `2 DAYS LEFT`,
`DUE TODAY`, or `3 DAYS OVERDUE`. Overdue contracts turn red and pulse.

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

## Part 3 — For developers

### Commands

```
npm install      install dependencies (once)
npm run dev      Vite + Electron with hot reload
npm start        build, then open in Electron
npm run dist     produce release\CRIME.NET-1.0.0-portable.exe
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
  CityMap.jsx            procedural city map, fixed seed, square grid (SVG)
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

Old save files migrate automatically: the v1 `days[].assets` structure is flattened
into a plain `items` list inside `normalize()`.

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
