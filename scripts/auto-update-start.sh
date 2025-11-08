#!/bin/bash

# Gemini Chat 自動更新＆起動スクリプト
# スタートアップ時にGitから最新版をpullし、変更があればビルドしてから起動

set -e

# カラー定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# プロジェクトディレクトリ
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"
cd "$APP_DIR"

# ログファイル
LOG_FILE="$APP_DIR/auto-update.log"

# ログ記録関数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "======================================"
log "Gemini Chat 自動更新チェック開始"
log "======================================"

# Git更新前のハッシュを記録
BEFORE_HASH=$(git rev-parse HEAD)
log "現在のコミット: $BEFORE_HASH"

# Git pullを実行
log "Git pullを実行中..."
git fetch origin main

# リモートとの差分をチェック
AFTER_HASH=$(git rev-parse origin/main)

if [ "$BEFORE_HASH" = "$AFTER_HASH" ]; then
    log "変更なし。既に最新版です。"
    NEED_BUILD=false
else
    log "変更を検出。更新を適用します..."
    log "新しいコミット: $AFTER_HASH"

    # pullを実行
    git pull origin main

    log "更新完了。ビルドを開始します..."
    NEED_BUILD=true
fi

# ビルドが必要な場合
if [ "$NEED_BUILD" = true ]; then
    log "npm依存関係をインストール中..."
    npm install >> "$LOG_FILE" 2>&1

    log "アプリケーションをビルド中..."
    npm run electron:build >> "$LOG_FILE" 2>&1

    log "ビルド完了"
fi

# アプリケーションを起動
log "アプリケーションを起動中..."
log "======================================"

# アプリを起動（このスクリプトはバックグラウンドで実行されるため、execで置き換える）
exec "$APP_DIR/release/linux-arm64-unpacked/raspi-gemini-chat"
