const { app, dialog, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

// Resolved lazily since app.getPath() only works after the app is ready
function getLibraryPath() {
  return path.join(app.getPath('userData'), 'library.json')
}

// Reads the saved library from disk, returns [] if missing or invalid
function loadLibrary() {
  const libraryPath = getLibraryPath()

  // Check if library file exists
  if (!fs.existsSync(libraryPath)) {
    return []
  }

  // Read the library file
  try {
    const library = fs.readFileSync(libraryPath, 'utf8')
    // Parse the JSON
    const libraryData = JSON.parse(library)
    return libraryData
  } catch (error) {
    console.error('Error reading library file:', error)
    return []
  }
}

// Adds new file paths to the library and saves it
function addFilesToLibrary(filePaths) {
  const libraryData = loadLibrary()
  libraryData.push(...filePaths)
  saveLibrary(libraryData)
  return libraryData
}

// Writes the library array to disk as JSON
function saveLibrary(libraryData) {
  fs.writeFileSync(getLibraryPath(), JSON.stringify(libraryData, null, 2))
  console.log('Library saved successfully')
}

// Resets the saved library to empty (manual utility, not called automatically)
function clearLibrary() {
  fs.writeFileSync(getLibraryPath(), JSON.stringify([], null, 2))
  console.log('Library cleared successfully')
}

app.whenReady().then(() => {
  // Main window, loads the renderer HTML via the preload bridge
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')

  // Lets the renderer fetch the saved library on startup
  ipcMain.handle('library:get', () => {
    return loadLibrary()
  })

  // Opens the native file picker, saves picked files to the library
  ipcMain.handle('dialog:openFile', async () => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openFile', 'multiSelections']
    })
    
    // Add the new files to the library
    const updatedLibrary = addFilesToLibrary(result.filePaths)
    
    return updatedLibrary
  })

  // Adds files to the library (called from renderer)
  ipcMain.handle('library:addFiles', (event, filePaths) => addFilesToLibrary(filePaths))

  // Read file bytes
  ipcMain.handle('file:readBytes', (event, filePath) => fs.readFileSync(filePath))
})
