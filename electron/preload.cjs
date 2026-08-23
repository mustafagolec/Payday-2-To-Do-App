'use strict'

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('pd2', {
  isDesktop: true,
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
