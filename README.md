# Gemini Chat - 1920×515 Display Optimized

Raspberry Pi 5用の1920×515ディスプレイに最適化されたGemini AIチャットアプリケーション。

## 特徴

- 🖥️ 1920×515の横長ディスプレイに完全最適化
- 🤖 Gemini 2.0 Flash、1.5 Pro、1.5 Flash、1.5 Flash-8B対応
- 🎨 Imagen 3による画像生成（※要追加設定）
- ⚡ Raspberry Pi 5で高速動作
- 🎯 スタートアップ自動起動対応
- 💾 ローカルストレージによるチャット履歴保存

## 必要要件

- Raspberry Pi 5 (推奨) または Raspberry Pi 4
- Raspberry Pi OS
- Node.js 18以上
- Gemini API Key ([取得はこちら](https://makersuite.google.com/app/apikey))

## クイックスタート（Raspberry Pi）

Raspberry Piで5分でセットアップする方法：

```bash
# 1. リポジトリをクローン
cd ~
git clone https://github.com/Koki-dec/PiChat.git ai-chat
cd ai-chat

# 2. セットアップスクリプトを実行
chmod +x setup-raspi.sh
./setup-raspi.sh

# 3. アプリを起動
./release/linux-arm64-unpacked/gemini-chat
```

詳細は [`QUICK_START.md`](./QUICK_START.md) を参照してください。

## 開発環境でのインストール

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 開発環境での実行

```bash
# Vite開発サーバー起動
npm run dev

# Electronアプリとして起動
npm run electron:dev
```

### 3. ビルド

```bash
# プロダクションビルド
npm run electron:build
```

ビルド成果物は `release/` ディレクトリに生成されます。

## Raspberry Piでの自動起動設定

### 方法1: autostart（推奨）

1. autostartファイルを作成:

```bash
mkdir -p ~/.config/autostart
nano ~/.config/autostart/gemini-chat.desktop
```

2. 以下の内容を記述:

```ini
[Desktop Entry]
Type=Application
Name=Gemini Chat
Exec=/path/to/ai-chat/release/linux-arm64-unpacked/gemini-chat
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
```

3. 実行権限を付与:

```bash
chmod +x ~/.config/autostart/gemini-chat.desktop
```

### 方法2: systemdサービス

1. サービスファイルを作成:

```bash
sudo nano /etc/systemd/system/gemini-chat.service
```

2. 以下の内容を記述:

```ini
[Unit]
Description=Gemini Chat Application
After=graphical.target

[Service]
Type=simple
User=pi
Environment=DISPLAY=:0
Environment=XAUTHORITY=/home/pi/.Xauthority
ExecStart=/path/to/ai-chat/release/linux-arm64-unpacked/gemini-chat
Restart=on-failure

[Install]
WantedBy=graphical.target
```

3. サービスを有効化:

```bash
sudo systemctl enable gemini-chat.service
sudo systemctl start gemini-chat.service
```

## 使い方

### 初回セットアップ

1. アプリを起動
2. 右上の設定ボタンをクリック
3. Gemini API Keyを入力
4. 保存ボタンをクリック

### チャット

1. 上部のモデル選択ボタンから使用するモデルを選択
2. 下部の入力欄にメッセージを入力
3. Enterキーまたは送信ボタンで送信

### 画像生成

1. "Imagen 3" モデルを選択
2. 画像生成のプロンプトを入力
3. 送信

## 技術スタック

- **フレームワーク**: Electron + React + TypeScript
- **ビルドツール**: Vite
- **スタイリング**: Tailwind CSS
- **API**: Google Generative AI (@google/generative-ai)
- **アイコン**: Lucide React

## ディレクトリ構成

```
ai-chat/
├── electron/          # Electronメインプロセス
│   ├── main.ts
│   └── preload.ts
├── src/              # Reactフロントエンド
│   ├── components/   # UIコンポーネント
│   ├── services/     # Gemini APIサービス
│   ├── types/        # 型定義
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── dist/             # ビルド成果物（Web）
├── dist-electron/    # ビルド成果物（Electron）
└── release/          # 配布パッケージ
```

## トラブルシューティング

### APIキーエラー

- 設定パネルでAPIキーが正しく入力されているか確認
- APIキーの有効性を確認

### 画面サイズが合わない

- `electron/main.ts` の `width` と `height` を調整
- ディスプレイの実際の解像度を確認

### Raspberry Piで起動しない

- Node.jsのバージョンを確認（18以上）
- 実行権限を確認
- ログを確認: `journalctl -u gemini-chat.service`

## ライセンス

MIT

## 作者

Your Name
