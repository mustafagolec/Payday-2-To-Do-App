'use strict'

const electron = require('electron')
const path = require('node:path')
const fs = require('node:fs')

// ELECTRON_RUN_AS_NODE set ise (VS Code terminali bunu birakir) Electron GUI yerine
// duz Node gibi acilir ve `app` tanimsiz olur. Ortami temizleyip bir kez yeniden baslat.
if (!electron || !electron.app) {
  console.error('[crimenet] ELECTRON_RUN_AS_NODE ayarli oldugu icin Electron GUI modunda baslamadi.')

  // Paketlenmis exe'de yeniden baslatma ise yaramaz: portable sarmalayici cikista
  // gecici klasoru siler ve yeni surec de onunla birlikte gider.
  const packaged = !/^electron(\.exe)?$/i.test(path.basename(process.execPath))
  if (packaged || process.env.CRIMENET_RELAUNCHED) {
    console.error('[crimenet] Bu degiskeni kaldirip tekrar deneyin; normal bir PowerShell penceresi yeterli.')
    process.exit(1)
  }

  console.error('[crimenet] Temiz ortamla yeniden baslatiliyor…')
  const { spawn } = require('node:child_process')
  const env = { ...process.env, CRIMENET_RELAUNCHED: '1' }
  delete env.ELECTRON_RUN_AS_NODE
  spawn(process.execPath, process.argv.slice(1), { env, detached: true, stdio: 'ignore' }).unref()
  process.exit(0)
}

const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = electron

const DEV_URL = process.env.VITE_DEV_SERVER_URL
const isDev = Boolean(DEV_URL)

/** @type {BrowserWindow | null} */
let win = null

const dataFile = () => path.join(app.getPath('userData'), 'crimenet-data.json')
const backupFile = () => path.join(app.getPath('userData'), 'crimenet-data.bak.json')

function readData () {
  for (const file of [dataFile(), backupFile()]) {
    try {
      if (!fs.existsSync(file)) continue
      const raw = fs.readFileSync(file, 'utf8')
      if (!raw.trim()) continue
      return JSON.parse(raw)
    } catch (err) {
      console.error('[crimenet] okuma hatasi:', file, err.message)
    }
  }
  return null
}

// Once yedegi tazele, sonra gecici dosyaya yaz ve yerine tasi:
// yazma sirasinda cokme olsa bile elde saglam bir kopya kalir.
function writeData (state) {
  const target = dataFile()
  const tmp = `${target}.tmp`
  fs.mkdirSync(path.dirname(target), { recursive: true })
  if (fs.existsSync(target)) {
    try { fs.copyFileSync(target, backupFile()) } catch { /* yedek zorunlu degil */ }
  }
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2), 'utf8')
  fs.renameSync(tmp, target)
  return target
}

function createWindow () {
  win = new BrowserWindow({
    width: 1600,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    show: false,
    frame: false,
    backgroundColor: '#04090f',
    title: 'CRIME.NET',
    icon: path.join(__dirname, '..', 'build', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      spellcheck: false
    }
  })

  Menu.setApplicationMenu(null)
  win.once('ready-to-show', () => win.show())

  const emitState = () => {
    if (!win || win.isDestroyed()) return
    win.webContents.send('win:state', {
      maximized: win.isMaximized(),
      fullscreen: win.isFullScreen()
    })
  }
  win.on('maximize', emitState)
  win.on('unmaximize', emitState)
  win.on('enter-full-screen', emitState)
  win.on('leave-full-screen', emitState)

  // Disari acilan her linki sistem tarayicisina yolla, uygulama penceresine degil.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) shell.openExternal(url)
    return { action: 'deny' }
  })

  if (isDev) {
    win.loadURL(DEV_URL)
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }

  win.on('closed', () => { win = null })
}

app.whenReady().then(() => {
  ipcMain.handle('data:load', () => ({ data: readData(), path: dataFile() }))

  ipcMain.handle('data:save', (_e, state) => {
    try {
      return { ok: true, path: writeData(state) }
    } catch (err) {
      console.error('[crimenet] yazma hatasi:', err)
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('data:export', async (_e, state) => {
    const stamp = new Date().toISOString().slice(0, 10)
    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      title: 'Kayitlari disa aktar',
      defaultPath: `crimenet-${stamp}.json`,
      filters: [{ name: 'JSON', extensions: ['json'] }]
    })
    if (canceled || !filePath) return { ok: false, canceled: true }
    fs.writeFileSync(filePath, JSON.stringify(state, null, 2), 'utf8')
    return { ok: true, path: filePath }
  })

  ipcMain.handle('data:import', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      title: 'Kayit dosyasi ac',
      properties: ['openFile'],
      filters: [{ name: 'JSON', extensions: ['json'] }]
    })
    if (canceled || !filePaths.length) return { ok: false, canceled: true }
    try {
      const data = JSON.parse(fs.readFileSync(filePaths[0], 'utf8'))
      return { ok: true, data, path: filePaths[0] }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  })

  ipcMain.handle('data:reveal', () => {
    const file = dataFile()
    if (fs.existsSync(file)) shell.showItemInFolder(file)
    else shell.openPath(path.dirname(file))
    return file
  })

  ipcMain.on('win:minimize', () => win?.minimize())
  ipcMain.on('win:maximize', () => {
    if (!win) return
    if (win.isMaximized()) win.unmaximize()
    else win.maximize()
  })
  ipcMain.on('win:fullscreen', () => win?.setFullScreen(!win.isFullScreen()))
  ipcMain.on('win:close', () => win?.close())

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
