const { app, dialog, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
const Database = require('better-sqlite3')
const crypto = require('crypto')

// Initialize database
const db = new Database(path.join(app.getPath('userData'), 'sidenote.db'))

// Create the table
db.exec(`
  CREATE TABLE IF NOT EXISTS documents (
    id          TEXT PRIMARY KEY,
    sha256      TEXT,
    pdf_id      TEXT,
    fingerprint TEXT,
    title       TEXT,
    last_path   TEXT
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS highlights (
    id          TEXT PRIMARY KEY,
    document_id TEXT NOT NULL REFERENCES documents(id),
    sort_index  TEXT NOT NULL,
    color       TEXT,
    quote       TEXT NOT NULL,
    prefix      TEXT NOT NULL,
    suffix      TEXT NOT NULL,
    char_start  INTEGER,
    char_end    INTEGER,
    page_index  INTEGER NOT NULL,
    rects       TEXT NOT NULL,
    created_at  TEXT NOT NULL
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS comments (
    id           TEXT PRIMARY KEY,
    highlight_id TEXT NOT NULL REFERENCES highlights(id),
    parent_id    TEXT REFERENCES comments(id),
    seq          INTEGER NOT NULL,
    author_kind  TEXT NOT NULL,
    author_name  TEXT NOT NULL,
    body         TEXT NOT NULL,
    created_at   TEXT NOT NULL,
    edited_at    TEXT,
    resolved     INTEGER DEFAULT 0,
    ai_provider   TEXT,
    ai_model      TEXT,
    ai_context    TEXT,
    ai_tokens_in  INTEGER,
    ai_tokens_out INTEGER
  )
`)


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

  // Get or create document
  ipcMain.handle('document:getOrCreate', (event, { sha256, title, filePath }) => {
    const existing = db.prepare('SELECT id FROM documents WHERE sha256 = ?').get(sha256)
    if (existing) return existing.id

    const id = crypto.randomUUID()
    db.prepare('INSERT INTO documents (id, sha256, title, last_path) VALUES (?, ?, ?, ?)')
      .run(id, sha256, title, filePath)
    return id
  })

  // Save annotation
  ipcMain.handle('highlight:create', (event, highlight) => {
    db.prepare('INSERT INTO highlights (id, document_id, sort_index, quote, prefix, suffix, char_start, char_end, page_index, rects, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(highlight.id, highlight.document_id, highlight.sort_index, highlight.quote, highlight.prefix, highlight.suffix, highlight.char_start, highlight.char_end, highlight.page_index, highlight.rects, highlight.created_at)
  })

  // Get annotations for a document in sorted order
  ipcMain.handle('highlights:getByPage', (event, documentId, pageIndex) => {
    return db.prepare('SELECT * FROM highlights WHERE document_id = ? AND page_index = ? ORDER BY sort_index').all(documentId, pageIndex)
  })

  // Create comment
  ipcMain.handle('comment:create', (event, comment) => {
    db.prepare('INSERT INTO comments (id, highlight_id, parent_id, seq, author_kind, author_name, body, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(comment.id, comment.highlight_id, comment.parent_id, comment.seq, comment.author_kind, comment.author_name, comment.body, comment.created_at)
  })

  // Get comments by highlight ID
  ipcMain.handle('comments:getByHighlight', (event, highlightId) => {
    return db.prepare('SELECT * FROM comments WHERE highlight_id = ? ORDER BY seq').all(highlightId)
  })
})
