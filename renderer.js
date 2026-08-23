import * as pdfjsLib from './node_modules/pdfjs-dist/build/pdf.mjs'
import search from './node_modules/approx-string-match/build/src/index.js'
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
let unlabeledHighlights = []

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

  const pdf_id = pdf.fingerprints[0]
  const page1 = await pdf.getPage(1)
  const page1TextContent = await page1.getTextContent()
  const page1Text = page1TextContent.items.map(item => item.str + (item.hasEOL ? '\n' : '')).join('')
  const fingerprint = normalize(page1Text) + '|' + pdf.numPages

  const sha256 = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
  const title = filePath.split('/').pop()
  currentDocumentId = await window.api.getOrCreateDocument(sha256, title, filePath, pdf_id, fingerprint)

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
  // Reset unlabeled highlights for this page
  unlabeledHighlights = []

  for (const highlight of highlights) {
    // Get comments for this highlight
    const comments = await window.api.getCommentsByHighlight(highlight.id)

    const resolution = resolveHighlight(highlight)
    if (resolution.matched === 'orphan') {
      console.warn('Highlight could not be reanchored, skipping draw:', highlight.id)
    }

    if (comments.length !== 0) {
      // Create a comment element for each highlight
      const commentElement = document.createElement('div')
      const commentTextarea = document.createElement('textarea')
      const commentSaveBtn = document.createElement('button')
      commentTextarea.className = 'comment-textarea'
      commentSaveBtn.className = 'comment-save-btn'
      commentSaveBtn.textContent = 'Save'
      commentElement.className = 'comment'
      commentSaveBtn.onclick = () => {
        const comment = commentTextarea.value
        window.api.createComment({
          id: crypto.randomUUID(),
          highlight_id: highlight.id,
          parent_id: comments[0].id,
          seq: comments.length,
          author_kind: 'human',
          author_name: 'You',
          body: comment,
          created_at: new Date().toISOString()
        })
        commentTextarea.value = ''
      }
      commentElement.textContent = comments[0].body
      for (const comment of comments.slice(1)) {
        const commentReplyElement = document.createElement('div')
        commentReplyElement.textContent = comment.body
        commentReplyElement.className = 'comment-reply'
        commentElement.appendChild(commentReplyElement)
      }
      commentElement.appendChild(commentTextarea)
      commentElement.appendChild(commentSaveBtn)
      commentRail.appendChild(commentElement)
    }
    else {
      unlabeledHighlights.push({ highlight, rects: JSON.parse(highlight.rects) })
    }
    // Apply existing highlight, unless it couldn't be reanchored
    if (resolution.matched !== 'orphan') {
      renderHighlights(JSON.parse(highlight.rects))
    }
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
  else {
    currentScale = 3
  }
  renderPage(currentPageNum)
})

zoomOutBtn.addEventListener('click', () => {
  if (currentScale > 0.5) {
    currentScale -= 0.1
  }
  else {
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
    rectsToSave = Array.from(rects).filter(r => r.width > 0 && r.height > 0).map(r => ({
      left: (r.left - pageContainerRect.left)/currentScale,
      top: (r.top - pageContainerRect.top)/currentScale,
      width: r.width/currentScale,
      height: r.height/currentScale
    }))
  }
  else {
    selectedText = ''
    rectsToSave = []
    addCommentBtn.style.display = 'none'
  }
})

// Creates a textarea + Save card for a highlight and appends it to the rail
function createComposeCard(onSave) {
  const commentElement = document.createElement('div')
  const commentTextarea = document.createElement('textarea')
  const commentSaveBtn = document.createElement('button')
  commentTextarea.className = 'comment-textarea'
  commentSaveBtn.className = 'comment-save-btn'
  commentSaveBtn.textContent = 'Save'
  commentElement.className = 'comment'
  commentSaveBtn.onclick = () => {
    onSave(commentTextarea.value)
    commentTextarea.value = ''
  }
  commentElement.appendChild(commentTextarea)
  commentElement.appendChild(commentSaveBtn)
  commentRail.appendChild(commentElement)
}

textLayer.addEventListener('click', (event) => {
  // Get relative position of click
  const rect = textLayer.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  // Find which unlabeled highlight contains this position
  outer: for (let i = 0; i < unlabeledHighlights.length; i++) {
    const highlight = unlabeledHighlights[i]
    const rects = highlight.rects
    for (let j = 0; j < rects.length; j++) {
      const rect = rects[j]
      if (x >= (rect.left * currentScale) && x <= (rect.left * currentScale) + (rect.width * currentScale) &&
        y >= (rect.top * currentScale) && y <= (rect.top * currentScale) + (rect.height * currentScale)) {
        // This is the highlight that was clicked
        createComposeCard((body) => {
          window.api.createComment({
            id: crypto.randomUUID(),
            highlight_id: highlight.highlight.id,
            parent_id: null,
            seq: 0,
            author_kind: 'human',
            author_name: 'You',
            body: body,
            created_at: new Date().toISOString()
          })
        })
        break outer
      }
    }
  }
})

function renderHighlights(rectsToRender) {
  // TODO: Implement highlight rendering
  for (let i = 0; i < rectsToRender.length; i++) {
    const rect = rectsToRender[i]
    // Create a highlight element
    const highlight = document.createElement('div')
    highlight.style.position = 'absolute'
    highlight.style.left = (rect.left * currentScale) + 'px'
    highlight.style.top = (rect.top * currentScale) + 'px'
    highlight.style.width = (rect.width * currentScale) + 'px'
    highlight.style.height = (rect.height * currentScale) + 'px'
    highlight.style.backgroundColor = 'yellow'
    highlight.style.mixBlendMode = 'multiply'
    highlight.style.opacity = '0.4'
    highlight.style.pointerEvents = 'none'
    highlight.style.zIndex = '1'
    highlightsLayer.appendChild(highlight)
  }
}

function normalize(s) {
  return s.replace(/\s+/g, ' ').trim()
}

addCommentBtn.addEventListener('click', () => {
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
    sort_index: `${(currentPageNum - 1).toString().padStart(5, '0')}|${index.toString().padStart(6, '0')}|${Math.round(rectsToSave[0].top).toString().padStart(5, '0')}`,
    quote: normalizedSelectedText,
    prefix: prefix,
    suffix: suffix,
    char_start: index,
    char_end: index + normalizedSelectedText.length,
    page_index: currentPageNum - 1,
    rects: JSON.stringify(rectsToSave),
    created_at: new Date().toISOString(),
  }

  createComposeCard((body) => {
    window.api.createHighlight(objToSave)
    window.api.createComment({
      id: crypto.randomUUID(),
      highlight_id: objToSave.id,
      parent_id: null,
      seq: 0,
      author_kind: 'human',
      author_name: 'You',
      body: body,
      created_at: new Date().toISOString()
    })
    renderHighlights(rectsToSave)
    addCommentBtn.style.display = 'none'
  })
})

function verifyExactMatch(highlight, pageText) {
  return normalize(pageText).substring(highlight.char_start, highlight.char_end) === highlight.quote
}

function fuzzyReanchor(highlight, pageText) {
  const searchResult = search(normalize(pageText), highlight.quote, 5)
  if (searchResult.length === 0) {
    return null
  }
  return searchResult[0].start
}

function resolveHighlight(highlight) {
  const pageText = currentPageText
  if (verifyExactMatch(highlight, pageText)) {
    return {
      matched: 'exact',
      position: highlight.char_start
    }
  }
  const position = fuzzyReanchor(highlight, pageText)
  if (position !== null) {
    return {
      matched: 'fuzzy',
      position: position
    }
  }
  return {
    matched: 'orphan',
    position: null
  }
}

const exportPdfBtn = document.getElementById('exportPdfBtn')
exportPdfBtn.addEventListener('click', async () => {
  const result = await window.api.exportPdf(currentDocumentId)
  console.log('Current document ID:', currentDocumentId)
  console.log('Export result:', result)
})