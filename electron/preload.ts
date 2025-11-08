import { contextBridge, ipcRenderer } from 'electron'

// Electronの機能をReactアプリに公開
contextBridge.exposeInMainWorld('electron', {
  // アプリケーション制御
  quit: () => ipcRenderer.send('app-quit'),
  minimize: () => ipcRenderer.send('app-minimize'),

  // 環境変数の取得・設定
  getEnv: (key: string) => ipcRenderer.invoke('get-env', key),
  setEnv: (key: string, value: string) => ipcRenderer.invoke('set-env', key, value),
})

// 型定義をグローバルに追加
declare global {
  interface Window {
    electron: {
      quit: () => void
      minimize: () => void
      getEnv: (key: string) => Promise<string | undefined>
      setEnv: (key: string, value: string) => Promise<boolean>
    }
  }
}
