const openBtn = document.getElementById('openBtn')
const fileList = document.getElementById('fileList')

openBtn.addEventListener('click', async () => {
  const result = await window.api.openFile()

  if (result.canceled) return

  for (const filePath of result.filePaths) {
    const li = document.createElement('li')
    li.textContent = filePath
    fileList.appendChild(li)
  }
})