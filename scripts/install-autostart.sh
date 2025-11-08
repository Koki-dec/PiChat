#!/bin/bash

# Gemini Chat自動起動インストールスクリプト

set -e

echo "======================================"
echo "Gemini Chat 自動起動セットアップ"
echo "======================================"
echo ""

# 現在のディレクトリを取得
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"

echo "アプリケーションディレクトリ: $APP_DIR"
echo ""

# 方法を選択
echo "自動起動方法を選択してください:"
echo "1) autostart (推奨)"
echo "2) systemd service"
echo "3) 両方"
echo ""
read -p "選択 (1-3): " choice

case $choice in
  1|3)
    echo ""
    echo "--- autostart設定 ---"

    # autostartディレクトリを作成
    mkdir -p ~/.config/autostart

    # desktopファイルをコピー（パスを更新）
    sed "s|/home/pi/ai-chat|$APP_DIR|g" "$SCRIPT_DIR/autostart.desktop" > ~/.config/autostart/gemini-chat.desktop

    # 実行権限を付与
    chmod +x ~/.config/autostart/gemini-chat.desktop

    echo "✓ autostart設定が完了しました"
    echo "  場所: ~/.config/autostart/gemini-chat.desktop"
    ;;
esac

case $choice in
  2|3)
    echo ""
    echo "--- systemd service設定 ---"

    # サービスファイルをコピー（パスとユーザーを更新）
    sudo sed -e "s|/home/pi/ai-chat|$APP_DIR|g" \
             -e "s|User=pi|User=$USER|g" \
             -e "s|Group=pi|Group=$USER|g" \
             -e "s|/home/pi/.Xauthority|$HOME/.Xauthority|g" \
             "$SCRIPT_DIR/gemini-chat.service" > /tmp/gemini-chat.service

    sudo mv /tmp/gemini-chat.service /etc/systemd/system/gemini-chat.service

    # systemdをリロード
    sudo systemctl daemon-reload

    # サービスを有効化
    sudo systemctl enable gemini-chat.service

    echo "✓ systemd service設定が完了しました"
    echo ""
    echo "サービスコマンド:"
    echo "  起動: sudo systemctl start gemini-chat"
    echo "  停止: sudo systemctl stop gemini-chat"
    echo "  状態確認: sudo systemctl status gemini-chat"
    echo "  ログ確認: journalctl -u gemini-chat -f"
    ;;
esac

echo ""
echo "======================================"
echo "セットアップ完了！"
echo "======================================"
echo ""
echo "再起動後、アプリケーションが自動的に起動します。"
echo ""
read -p "今すぐ再起動しますか？ (y/N): " reboot_choice

if [[ $reboot_choice =~ ^[Yy]$ ]]; then
  echo "再起動します..."
  sudo reboot
else
  echo "後で手動で再起動してください。"
fi
