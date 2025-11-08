# クイックスタートガイド - Raspberry Piで5分でセットアップ

このガイドに従えば、Raspberry PiでGemini Chatを5分で起動できます。

## 前提条件

- Raspberry Pi 5 (または Raspberry Pi 4)
- Raspberry Pi OS (64-bit推奨)
- インターネット接続
- 1920×515のディスプレイ

## ステップ1: Node.jsのインストール（未インストールの場合）

```bash
# Node.jsのバージョン確認
node --version

# 18未満またはインストールされていない場合
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 確認
node --version  # v20.x.x が表示されればOK
```

## ステップ2: リポジトリのクローン

```bash
# ホームディレクトリに移動
cd ~

# リポジトリをクローン
git clone <YOUR_REPOSITORY_URL> ai-chat

# プロジェクトディレクトリに移動
cd ai-chat
```

## ステップ3: 自動セットアップ

```bash
# セットアップスクリプトを実行
chmod +x setup-raspi.sh
./setup-raspi.sh
```

このスクリプトが自動的に：
- システムパッケージのインストール
- npm依存関係のインストール
- アプリケーションのビルド
- 実行権限の設定
- 自動起動の設定（オプション）

を行います。

## ステップ4: Gemini API Keyの取得

1. ブラウザで https://makersuite.google.com/app/apikey にアクセス
2. Googleアカウントでログイン
3. "Create API Key" をクリック
4. APIキーをコピー

## ステップ5: アプリを起動

```bash
# アプリを起動
./release/linux-arm64-unpacked/gemini-chat
```

または、ビルド後に自動起動を設定した場合は、Raspberry Piを再起動：

```bash
sudo reboot
```

## ステップ6: API Keyを設定

1. アプリが起動したら右上の⚙️（設定）アイコンをクリック
2. "Gemini API Key" 欄にコピーしたAPIキーを貼り付け
3. "保存" をクリック

## 完了！

これでGemini Chatが使えるようになりました。

- 上部のモデルボタンで使用するモデルを選択
- 下部の入力欄にメッセージを入力してEnterキー
- 画像生成は "Imagen 3" モデルを選択

## トラブルシューティング

### ビルドエラーが出る

```bash
# node_modulesを削除して再インストール
rm -rf node_modules
npm install
npm run electron:build
```

### アプリが起動しない

```bash
# 実行権限を確認
ls -la release/linux-arm64-unpacked/gemini-chat

# 権限がない場合
chmod +x release/linux-arm64-unpacked/gemini-chat
```

### メモリ不足エラー

Raspberry Pi 4の場合、ビルド時にメモリ不足になる可能性があります：

```bash
# スワップを増やす
sudo dphys-swapfile swapoff
sudo nano /etc/dphys-swapfile
# CONF_SWAPSIZE=2048 に変更
sudo dphys-swapfile setup
sudo dphys-swapfile swapon
```

## その他のコマンド

### 開発モードで起動

```bash
npm run electron:dev
```

### 自動起動を後から設定

```bash
cd scripts
./install-autostart.sh
```

### 自動起動を解除

```bash
cd scripts
./uninstall-autostart.sh
```

### チャット履歴を削除

アプリの設定パネルから「履歴を削除」ボタンをクリック

## サポート

詳細なセットアップ手順は `SETUP.md` を参照してください。
