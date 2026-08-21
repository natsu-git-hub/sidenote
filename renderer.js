import * as pdfjsLib from './node_modules/pdfjs-dist/build/pdf.mjs'
pdfjsLib.GlobalWorkerOptions.workerSrc = './node_modules/pdfjs-dist/build/pdf.worker.mjs'

const openBtn = document.getElementById('openBtn')
const fileList = document.getElementById('fileList')

let currentPdf = null
let currentPageNum = 1
let currentScale = 1.5

// Rebuilds the <ul> from scratch given a full list of file paths
function renderList(paths) {
  // clear the file list
  fileList.innerHTML = ''

  for (const filePath of paths) {
    const li = document.createElement('li')
    li.textContent = filePath
    li.addEventListener('click', () => {
      openPdf(filePath)
    })
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

// Open a PDF file
async function openPdf(filePath) {
  const bytes = await window.api.readBytes(filePath)
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise
  
  currentPdf = pdf
  currentPageNum = 1
  currentScale = 1.5

  // Render the first page
  await renderPage(currentPageNum)
  
  return pdf
}

// Render a page
async function renderPage(pageNum) {
  const page = await currentPdf.getPage(pageNum)
  const viewport = page.getViewport({ scale: currentScale })

  const canvas = document.getElementById('pdfCanvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  const context = canvas.getContext('2d')

  pageNumInput.value = pageNum
  zoomLevelInput.value = Math.round(currentScale * 100)

  await page.render({ canvasContext: context, viewport }).promise
}

// Handle page navigation
const prevBtn = document.getElementById('prevBtn')
const nextBtn = document.getElementById('nextBtn')
const pageNumInput = document.getElementById('pageNum')

prevBtn.addEventListener('click', () => {
  if (currentPageNum > 1) {
    currentPageNum--
    renderPage(currentPageNum)
  }
})  

nextBtn.addEventListener('click', () => {
  if (currentPageNum < currentPdf.numPages) {
    currentPageNum++
    renderPage(currentPageNum)
  }
})

pageNumInput.addEventListener('change', () => {
  const pageNum = parseInt(pageNumInput.value)
  if (pageNum > 0 && pageNum <= currentPdf.numPages) {
    currentPageNum = pageNum
    renderPage(currentPageNum)
  }
  else {
    pageNumInput.value = currentPageNum
  }
})

// handle zoom
const zoomInBtn = document.getElementById('zoomInBtn')
const zoomOutBtn = document.getElementById('zoomOutBtn')
const zoomLevelInput = document.getElementById('zoomLevel')

zoomInBtn.addEventListener('click', () => {
  if (currentScale < 3) {
    currentScale += 0.1
  }
  else{
    currentScale = 3
  }
  renderPage(currentPageNum)
})

zoomOutBtn.addEventListener('click', () => {
  if (currentScale > 0.5) {
    currentScale -= 0.1
  }
  else{
    currentScale = 0.5
  }
  renderPage(currentPageNum)
})

zoomLevelInput.addEventListener('change', () => {
  const scale = parseInt(zoomLevelInput.value) / 100
  if (scale >= 0.5 && scale <= 3) {
    currentScale = scale
    renderPage(currentPageNum)
  }
  else {
    zoomLevelInput.value = Math.round(currentScale * 100)
  }
})
