#!/bin/bash

# Gemini Chat自動起動アンインストールスクリプト

set -e

echo "======================================"
echo "Gemini Chat 自動起動削除"
echo "======================================"
echo ""

removed_count=0

# autostart設定を削除
if [ -f ~/.config/autostart/gemini-chat.desktop ]; then
  rm ~/.config/autostart/gemini-chat.desktop
  echo "✓ autostart設定を削除しました"
  ((removed_count++))
fi

# systemd service設定を削除
if [ -f /etc/systemd/system/gemini-chat.service ]; then
  sudo systemctl stop gemini-chat.service 2>/dev/null || true
  sudo systemctl disable gemini-chat.service 2>/dev/null || true
  sudo rm /etc/systemd/system/gemini-chat.service
  sudo systemctl daemon-reload
  echo "✓ systemd service設定を削除しました"
  ((removed_count++))
fi

echo ""
if [ $removed_count -eq 0 ]; then
  echo "削除する自動起動設定が見つかりませんでした。"
else
  echo "======================================"
  echo "削除完了！"
  echo "======================================"
fi
