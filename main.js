const { app, dialog, BrowserWindow, ipcMain } = require('electron')

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: require('path').join(__dirname, 'preload.js')
    }
  })
  
  win.loadFile('index.html')

  ipcMain.handle('dialog:openFile', async () => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openFile', 'multiSelections']
    })
    return result
  })
})