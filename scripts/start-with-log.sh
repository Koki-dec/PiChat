#!/bin/bash

# デバッグ用起動スクリプト
# autostartの問題を特定するためのログ出力版

LOG_FILE="$HOME/ai-chat-startup.log"

echo "=====================================" > "$LOG_FILE"
echo "Gemini Chat Startup Log" >> "$LOG_FILE"
echo "Time: $(date)" >> "$LOG_FILE"
echo "User: $(whoami)" >> "$LOG_FILE"
echo "Home: $HOME" >> "$LOG_FILE"
echo "Display: $DISPLAY" >> "$LOG_FILE"
echo "=====================================" >> "$LOG_FILE"

# 環境変数の確認
echo "Environment:" >> "$LOG_FILE"
env >> "$LOG_FILE" 2>&1

# パスの確認
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    APP_PATH="$HOME/ai-chat/release/mac-arm64/Gemini Chat.app/Contents/MacOS/Gemini Chat"
else
    # Linux
    APP_PATH="$HOME/ai-chat/release/linux-arm64-unpacked/raspi-gemini-chat"
fi

echo "" >> "$LOG_FILE"
echo "Checking app path: $APP_PATH" >> "$LOG_FILE"
echo "OS: $OSTYPE" >> "$LOG_FILE"

if [ -f "$APP_PATH" ]; then
    echo "✓ App file exists" >> "$LOG_FILE"
    ls -la "$APP_PATH" >> "$LOG_FILE"
else
    echo "✗ App file NOT found" >> "$LOG_FILE"
    echo "Listing release directory:" >> "$LOG_FILE"
    ls -la "$HOME/ai-chat/release/" >> "$LOG_FILE" 2>&1
    exit 1
fi

# DISPLAYが設定されているか確認
if [ -z "$DISPLAY" ]; then
    echo "✗ DISPLAY not set, setting to :0" >> "$LOG_FILE"
    export DISPLAY=:0
fi

# Gitリポジトリを更新
echo "" >> "$LOG_FILE"
echo "Updating git repository..." >> "$LOG_FILE"
cd "$HOME/ai-chat"
git pull origin main >> "$LOG_FILE" 2>&1

# アプリを再ビルド（必要な場合）
echo "" >> "$LOG_FILE"
echo "Rebuilding application..." >> "$LOG_FILE"
npm run build >> "$LOG_FILE" 2>&1

# 実行
echo "" >> "$LOG_FILE"
echo "Starting application..." >> "$LOG_FILE"
echo "Command: $APP_PATH" >> "$LOG_FILE"

# アプリを起動（エラー出力もログに）
"$APP_PATH" >> "$LOG_FILE" 2>&1 &

APP_PID=$!
echo "Application started with PID: $APP_PID" >> "$LOG_FILE"

# 起動成功を確認
sleep 2
if ps -p $APP_PID > /dev/null; then
    echo "✓ Application is running" >> "$LOG_FILE"
else
    echo "✗ Application failed to start or crashed" >> "$LOG_FILE"
fi
