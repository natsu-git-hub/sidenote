const openBtn = document.getElementById('openBtn')
const fileList = document.getElementById('fileList')

// Rebuilds the <ul> from scratch given a full list of file paths
function renderList(paths) {
  // clear the file list
  fileList.innerHTML = ''

  for (const filePath of paths) {
    const li = document.createElement('li')
    li.textContent = filePath
    fileList.appendChild(li)
  }
}

// Opens the file picker, then re-renders the list with the updated library
openBtn.addEventListener('click', async () => {
  const result = await window.api.openFile()
  renderList(result)
})

// Load the library on startup
window.api.getLibrary().then((result) => {
  renderList(result)
})

// Handle drag and drop
document.addEventListener('dragover', (event) => {
  event.preventDefault()
})

document.addEventListener('drop', async (event) => {
  event.preventDefault()

  const files = event.dataTransfer.files
  const paths = []

  for (const file of files) {
    paths.push(window.api.getPathForFile(file))
  }

  const result = await window.api.addFiles(paths)
  renderList(result)
})
