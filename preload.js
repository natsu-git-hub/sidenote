const { contextBridge, ipcRenderer } = require('electron')

// Exposes a safe `window.api` to the renderer, since it can't call ipcRenderer directly
contextBridge.exposeInMainWorld('api', {
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  getLibrary: () => ipcRenderer.invoke('library:get')
})