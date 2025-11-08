#!/bin/bash

# Autostart完全修正スクリプト
# 複数の方法を試して確実に動くようにする

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}======================================"
echo "Autostart完全修正スクリプト"
echo "======================================"
echo -e "${NC}"

# カレントディレクトリを取得
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"
APP_EXEC="$APP_DIR/release/linux-arm64-unpacked/raspi-gemini-chat"

echo "アプリケーションパス: $APP_EXEC"

# 実行ファイルの存在確認
if [ ! -f "$APP_EXEC" ]; then
    echo -e "${RED}エラー: 実行ファイルが見つかりません${NC}"
    echo "パス: $APP_EXEC"
    exit 1
fi

# 実行権限を確認・付与
chmod +x "$APP_EXEC"
chmod +x "$SCRIPT_DIR/start-with-log.sh"

echo -e "${GREEN}✓ 実行ファイルを確認${NC}"
echo ""

# 既存の設定をクリーンアップ
echo "既存の設定をクリーンアップ中..."
rm -f ~/.config/autostart/gemini-chat.desktop
sudo systemctl stop gemini-chat 2>/dev/null || true
sudo systemctl disable gemini-chat 2>/dev/null || true
echo ""

# 選択肢を表示
echo "自動起動の方法を選択してください:"
echo ""
echo "1) デバッグモード（ログ出力あり） - 推奨"
echo "2) 通常モード（直接起動）"
echo "3) systemdサービス"
echo "4) 全て試す（1と3の両方）"
echo ""
read -p "選択 (1-4): " choice

case $choice in
  1|4)
    echo ""
    echo -e "${YELLOW}--- デバッグモード設定 ---${NC}"

    mkdir -p ~/.config/autostart

    cat > ~/.config/autostart/gemini-chat.desktop <<EOF
[Desktop Entry]
Type=Application
Name=Gemini Chat (Debug)
Comment=AI Chat with startup logging
Exec=$SCRIPT_DIR/start-with-log.sh
Terminal=false
X-GNOME-Autostart-enabled=true
StartupNotify=false
EOF

    chmod +x ~/.config/autostart/gemini-chat.desktop

    echo -e "${GREEN}✓ デバッグモードのautostart設定完了${NC}"
    echo "  ログファイル: ~/ai-chat-startup.log"
    echo "  再起動後、このログを確認してください"
    ;;
esac

case $choice in
  2)
    echo ""
    echo -e "${YELLOW}--- 通常モード設定 ---${NC}"

    mkdir -p ~/.config/autostart

    cat > ~/.config/autostart/gemini-chat.desktop <<EOF
[Desktop Entry]
Type=Application
Name=Gemini Chat
Comment=AI Chat Application
Exec=$APP_EXEC
Terminal=false
X-GNOME-Autostart-enabled=true
StartupNotify=false
EOF

    chmod +x ~/.config/autostart/gemini-chat.desktop

    echo -e "${GREEN}✓ 通常モードのautostart設定完了${NC}"
    ;;
esac

case $choice in
  3|4)
    echo ""
    echo -e "${YELLOW}--- systemdサービス設定 ---${NC}"

    sudo tee /etc/systemd/system/gemini-chat.service > /dev/null <<EOF
[Unit]
Description=Gemini Chat Application
After=graphical.target network-online.target
Wants=network-online.target

[Service]
Type=simple
User=$USER
Environment=DISPLAY=:0
Environment=XAUTHORITY=$HOME/.Xauthority
WorkingDirectory=$APP_DIR
ExecStart=$APP_EXEC
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=graphical.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable gemini-chat.service

    echo -e "${GREEN}✓ systemdサービス設定完了${NC}"
    echo ""
    echo "サービスコマンド:"
    echo "  起動: sudo systemctl start gemini-chat"
    echo "  停止: sudo systemctl stop gemini-chat"
    echo "  状態: sudo systemctl status gemini-chat"
    echo "  ログ: journalctl -u gemini-chat -f"
    ;;
esac

echo ""
echo -e "${GREEN}======================================"
echo "設定完了！"
echo "======================================"
echo -e "${NC}"

if [ "$choice" = "1" ] || [ "$choice" = "4" ]; then
    echo -e "${YELLOW}デバッグモードが有効です。${NC}"
    echo "再起動後、以下のコマンドでログを確認してください:"
    echo "  cat ~/ai-chat-startup.log"
    echo ""
fi

read -p "今すぐ再起動しますか？ (y/N): " reboot_choice

if [[ $reboot_choice =~ ^[Yy]$ ]]; then
    echo "再起動します..."
    sudo reboot
else
    echo "後で手動で再起動してください。"
fi
