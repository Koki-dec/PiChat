# セットアップガイド - Raspberry Piでの導入手順

このガイドでは、Raspberry Pi 5にGemini Chatアプリをインストールし、自動起動を設定する手順を説明します。

## 前提条件

- Raspberry Pi 5 (または Raspberry Pi 4)
- Raspberry Pi OS (64-bit推奨)
- インターネット接続
- 1920×515のディスプレイ

## ステップ1: システムの準備

### Node.jsのインストール

```bash
# Node.jsのバージョン確認
node --version

# Node.js 18以上がインストールされていない場合
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 確認
node --version
npm --version
```

### 必要なパッケージのインストール

```bash
sudo apt-get update
sudo apt-get install -y git build-essential
```

## ステップ2: アプリケーションのダウンロード

### 開発版（ソースコードから）

```bash
# ホームディレクトリに移動
cd ~

# リポジトリをクローン（またはファイルを転送）
git clone <repository-url> ai-chat
cd ai-chat

# 依存関係をインストール
npm install

# ビルド
npm run electron:build
```

### リリース版（ビルド済み）

```bash
# ビルド済みパッケージを~/ai-chatに展開
cd ~
# （パッケージを転送してから）
tar -xzf gemini-chat-linux-arm64.tar.gz
```

## ステップ3: Gemini API Keyの取得

1. ブラウザで https://makersuite.google.com/app/apikey にアクセス
2. Googleアカウントでログイン
3. "Create API Key" をクリック
4. APIキーをコピー（後で使用）

## ステップ4: アプリケーションのテスト起動

```bash
cd ~/ai-chat

# 開発版の場合
npm run electron:dev

# リリース版の場合
./release/linux-arm64-unpacked/raspi-gemini-chat
```

起動したら：

1. 右上の設定アイコンをクリック
2. Gemini API Keyを入力
3. 「保存」をクリック
4. テストメッセージを送信して動作確認

動作確認後、アプリを終了します。

## ステップ5: 自動起動の設定

### 方法A: インストールスクリプトを使用（推奨）

```bash
cd ~/ai-chat/scripts

# スクリプトに実行権限を付与
chmod +x install-autostart.sh

# インストールスクリプトを実行
./install-autostart.sh
```

画面の指示に従って選択：

- **1) autostart (推奨)**: 最もシンプルな方法
- **2) systemd service**: より高度な制御が可能
- **3) 両方**: 両方の方法で設定

### 方法B: 手動でautostartを設定

```bash
# autostartディレクトリを作成
mkdir -p ~/.config/autostart

# desktopファイルをコピー
cp ~/ai-chat/scripts/autostart.desktop ~/.config/autostart/gemini-chat.desktop

# パスを環境に合わせて編集
nano ~/.config/autostart/gemini-chat.desktop

# 実行権限を付与
chmod +x ~/.config/autostart/gemini-chat.desktop
```

### 方法C: 手動でsystemdサービスを設定

```bash
# サービスファイルをコピー
sudo cp ~/ai-chat/scripts/gemini-chat.service /etc/systemd/system/

# パスとユーザー名を環境に合わせて編集
sudo nano /etc/systemd/system/gemini-chat.service

# systemdをリロード
sudo systemctl daemon-reload

# サービスを有効化
sudo systemctl enable gemini-chat.service

# サービスを起動（テスト）
sudo systemctl start gemini-chat.service

# 状態確認
sudo systemctl status gemini-chat.service
```

## ステップ6: 再起動とテスト

```bash
# システムを再起動
sudo reboot
```

再起動後、Gemini Chatアプリが自動的に起動するはずです。

## トラブルシューティング

### アプリが起動しない

```bash
# ログを確認（systemdサービスの場合）
journalctl -u gemini-chat -n 50

# 実行ファイルの権限を確認
ls -la ~/ai-chat/release/linux-arm64-unpacked/raspi-gemini-chat

# 手動で起動してエラーを確認
~/ai-chat/release/linux-arm64-unpacked/raspi-gemini-chat
```

### ディスプレイサイズが合わない

`~/ai-chat/electron/main.ts` の以下の部分を編集：

```typescript
mainWindow = new BrowserWindow({
  width: 1920,  // ディスプレイ幅に合わせて調整
  height: 515,  // ディスプレイ高さに合わせて調整
  ...
})
```

編集後、再ビルド：

```bash
cd ~/ai-chat
npm run electron:build
```

### APIキーエラー

1. アプリを起動
2. 設定パネルを開く
3. APIキーが正しく入力されているか確認
4. APIキーの有効性を確認（Google AI Studioで）

### 自動起動を無効化したい

```bash
# アンインストールスクリプトを使用
cd ~/ai-chat/scripts
chmod +x uninstall-autostart.sh
./uninstall-autostart.sh

# または手動で
rm ~/.config/autostart/gemini-chat.desktop
sudo systemctl disable gemini-chat.service
sudo systemctl stop gemini-chat.service
```

## パフォーマンス最適化

### Raspberry Pi 4での最適化

メモリ使用量を削減するため、`electron/main.ts` に以下を追加：

```typescript
app.commandLine.appendSwitch('--disable-gpu')
app.commandLine.appendSwitch('--disable-software-rasterizer')
```

### GPU加速を有効化（Raspberry Pi 5）

```bash
# /boot/config.txt を編集
sudo nano /boot/config.txt

# 以下を追加
dtoverlay=vc4-kms-v3d
gpu_mem=256

# 再起動
sudo reboot
```

## 追加設定

### 画面の自動オフを無効化

```bash
# スクリーンセーバーを無効化
sudo apt-get install xscreensaver
# xscreensaverの設定でDisableを選択

# 画面の自動オフを無効化
xset s off
xset -dpms
xset s noblank

# 起動時に自動実行
echo "xset s off" >> ~/.config/lxsession/LXDE-pi/autostart
echo "xset -dpms" >> ~/.config/lxsession/LXDE-pi/autostart
echo "xset s noblank" >> ~/.config/lxsession/LXDE-pi/autostart
```

### フルスクリーンモード

アプリを常にフルスクリーンで起動する場合、`electron/main.ts` を編集：

```typescript
mainWindow = new BrowserWindow({
  width: 1920,
  height: 515,
  frame: false,
  resizable: false,
  fullscreen: true,  // この行を追加
  ...
})
```

## サポート

問題が発生した場合：

1. README.mdのトラブルシューティングセクションを確認
2. ログファイルを確認
3. GitHubのIssuesで報告

## 次のステップ

- モデルを切り替えて試してみる
- 設定パネルでTemperatureやMax Tokensを調整
- チャット履歴をバックアップ（LocalStorageに保存されています）

お楽しみください！
