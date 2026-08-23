'use strict'

/**
 * Electron'u temiz bir ortamla baslatir.
 * VS Code'un entegre terminali ELECTRON_RUN_AS_NODE=1 birakiyor; bu degisken
 * set kaldiginda electron GUI yerine duz node gibi acilir ve `app` undefined olur.
 */

const { spawn } = require('node:child_process')
const electronPath = require('electron')

const env = { ...process.env }
delete env.ELECTRON_RUN_AS_NODE

const child = spawn(electronPath, ['.', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env,
  windowsHide: false
})

child.on('close', (code) => process.exit(code ?? 0))
