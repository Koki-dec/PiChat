import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let mainWindow: BrowserWindow | null = null

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 515,
    frame: true, // フレームを有効化してバツボタンを表示
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  })

  // 開発環境の場合
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173')
    // mainWindow.webContents.openDevTools() // 必要に応じてコメント解除
  } else {
    // プロダクション環境
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC通信：アプリケーション終了
ipcMain.on('app-quit', () => {
  app.quit()
})

// IPC通信：ウィンドウ最小化
ipcMain.on('app-minimize', () => {
  mainWindow?.minimize()
})

// IPC通信：環境変数の取得（APIキーなど）
ipcMain.handle('get-env', (_event, key: string) => {
  return process.env[key]
})

// IPC通信：環境変数の設定
ipcMain.handle('set-env', (_event, key: string, value: string) => {
  process.env[key] = value
  return true
})
