'use strict'

const { contextBridge, ipcRenderer } = require('electron')

const localeArg = process.argv.find((a) => a.startsWith('--crimenet-locale='))

contextBridge.exposeInMainWorld('pd2', {
  isDesktop: true,
  locale: localeArg ? localeArg.slice('--crimenet-locale='.length) : '',
  load: () => ipcRenderer.invoke('data:load'),
  save: (state) => ipcRenderer.invoke('data:save', state),
  exportData: (state) => ipcRenderer.invoke('data:export', state),
  importData: () => ipcRenderer.invoke('data:import'),
  revealData: () => ipcRenderer.invoke('data:reveal'),
  window: {
    minimize: () => ipcRenderer.send('win:minimize'),
    maximize: () => ipcRenderer.send('win:maximize'),
    fullscreen: () => ipcRenderer.send('win:fullscreen'),
    close: () => ipcRenderer.send('win:close'),
    onState: (cb) => {
      const handler = (_e, state) => cb(state)
      ipcRenderer.on('win:state', handler)
      return () => ipcRenderer.removeListener('win:state', handler)
    }
  }
})
