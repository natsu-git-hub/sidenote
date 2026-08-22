import * as pdfjsLib from './node_modules/pdfjs-dist/build/pdf.mjs'
pdfjsLib.GlobalWorkerOptions.workerSrc = './node_modules/pdfjs-dist/build/pdf.worker.mjs'

const openBtn = document.getElementById('openBtn')
const fileList = document.getElementById('fileList')
const thumbnailSidebar = document.getElementById('thumbnailSidebar')
const commentRail = document.getElementById('commentRail')

let currentPdf = null
let currentPageNum = 1
let currentScale = 1.5
let currentPageText = ''
let currentDocumentId = null

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
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes)
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise
  const sha256 = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
  const title = filePath.split('/').pop()
  currentDocumentId = await window.api.getOrCreateDocument(sha256, title, filePath)

  currentPdf = pdf
  currentPageNum = 1
  currentScale = 1.5

  // Render the first page
  await renderPage(currentPageNum)
  
  // Render thumbnails
  await renderThumbnails()
  
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

  const textContent = await page.getTextContent()

  const textLayerDiv = document.getElementById('textLayer')
  textLayerDiv.innerHTML = ''
  textLayerDiv.style.width = `${viewport.width}px`
  textLayerDiv.style.height = `${viewport.height}px`
  textLayerDiv.style.setProperty('--total-scale-factor', viewport.scale)

  const textLayer = new pdfjsLib.TextLayer({
    textContentSource: textContent,
    container: textLayerDiv,
    viewport: viewport
  })
  
  await textLayer.render()
  
  // Store the text content for later use
  currentPageText = textContent.items.map(item => item.str + (item.hasEOL ? '\n' : '')).join('')

  // Get highlights for this page
  const highlights = await window.api.getHighlightsByPage(currentDocumentId, currentPageNum - 1)
  
  // Clear existing comments
  commentRail.innerHTML = ''

  // Clear existing highlights
  highlightsLayer.innerHTML = ''
  
  for (const highlight of highlights) {
    // Create a comment element for each highlight
    const commentElement = document.createElement('div')
    commentElement.className = 'comment'
    commentElement.textContent = highlight.quote
    commentRail.appendChild(commentElement)

    // Apply existing highlight
    renderHighlights(JSON.parse(highlight.rects))
  }
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

// Render thumbnails
async function renderThumbnails() {
  thumbnailSidebar.innerHTML = ''
  
  for (let i = 1; i <= currentPdf.numPages; i++) {
    const page = await currentPdf.getPage(i)
    const viewport = page.getViewport({ scale: 0.2 })
    
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const context = canvas.getContext('2d')
    canvas.addEventListener('click', () => {
      currentPageNum = i
      renderPage(currentPageNum)
    })
    
    await page.render({ canvasContext: context, viewport }).promise
    
    thumbnailSidebar.appendChild(canvas)
  }
}

// Handle text selection
const addCommentBtn = document.getElementById('addCommentBtn')
const pageContainer = document.getElementById('pageContainer')
const textLayer = document.getElementById('textLayer')
const highlightsLayer = document.getElementById('highlightLayer')
let selectedText = ''
let rectsToSave = []

textLayer.addEventListener('mouseup', () => {
  const selection = window.getSelection()
  selectedText = selection.toString()
  if (selectedText) {
    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    const rects = range.getClientRects()

    // position at top right of selected text
    const pageContainerRect = pageContainer.getBoundingClientRect()
    addCommentBtn.style.display = 'block'
    addCommentBtn.style.top = (rect.top - pageContainerRect.top) + 'px'
    addCommentBtn.style.left = (rect.right - pageContainerRect.left) + 'px'
    
    // Store the rectangle for later use
    rectsToSave = Array.from(rects).map(r => ({
      left: r.left - pageContainerRect.left,
      top: r.top - pageContainerRect.top,
      width: r.width,
      height: r.height
    }))
  }
  else {
    selectedText = ''
    rectsToSave = []
    addCommentBtn.style.display = 'none'
  }
})

function renderHighlights(rectsToRender) {
  // TODO: Implement highlight rendering
  for (let i = 0; i < rectsToRender.length; i++) {
    const rect = rectsToRender[i]
    // Create a highlight element
    const highlight = document.createElement('div')
    highlight.style.position = 'absolute'
    highlight.style.left = rect.left + 'px'
    highlight.style.top = rect.top + 'px'
    highlight.style.width = rect.width + 'px'
    highlight.style.height = rect.height + 'px'
    highlight.style.backgroundColor = 'yellow'
    highlight.style.mixBlendMode = 'multiply'
    highlight.style.opacity = '0.4'
    highlight.style.pointerEvents = 'none'
    highlight.style.zIndex = '1'
    highlightsLayer.appendChild(highlight)
  }
}

addCommentBtn.addEventListener('click', () => {

  const normalize = (s) => s.replace(/\s+/g, ' ').trim()
  const normalizedCurrentPageText = normalize(currentPageText)
  const normalizedSelectedText = normalize(selectedText)
  const index = normalizedCurrentPageText.indexOf(normalizedSelectedText)

  // prefix of 32 characters before the selected text
  const prefix = normalizedCurrentPageText.substring(Math.max(0, index - 32), index)
  // suffix of 32 characters after the selected text
  const suffix = normalizedCurrentPageText.substring(index + normalizedSelectedText.length, index + normalizedSelectedText.length + 32)
  
  const objToSave = {
    id: crypto.randomUUID(),
    document_id: currentDocumentId,
    sort_index: `${(currentPageNum-1).toString().padStart(5, '0')}|${index.toString().padStart(6, '0')}|${Math.round(rectsToSave[0].top).toString().padStart(5, '0')}`,
    quote: normalizedSelectedText,
    prefix: prefix,
    suffix: suffix,
    char_start: index,
    char_end: index + normalizedSelectedText.length,
    page_index: currentPageNum - 1,
    rects: JSON.stringify(rectsToSave),
    created_at: new Date().toISOString(),
  }
  
  // save to database
  window.api.createHighlight(objToSave)

  // render highlights
  renderHighlights(rectsToSave)
})
