// Electron IPC型定義

export {}

declare global {
  interface Window {
    electron?: {
      quit: () => void
      minimize: () => void
      getEnv: (key: string) => Promise<string | undefined>
      setEnv: (key: string, value: string) => Promise<boolean>
    }
  }
}
