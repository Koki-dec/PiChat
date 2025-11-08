#!/bin/bash

# Raspberry Pi用 Gemini Chat クイックセットアップスクリプト

set -e

echo "======================================"
echo "Gemini Chat セットアップ"
echo "Raspberry Pi 5 最適化版"
echo "======================================"
echo ""

# 色の定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# エラーハンドリング
error_exit() {
    echo -e "${RED}エラー: $1${NC}" >&2
    exit 1
}

success_msg() {
    echo -e "${GREEN}✓ $1${NC}"
}

info_msg() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Node.jsのバージョンチェック
check_nodejs() {
    info_msg "Node.jsのバージョンを確認中..."

    if ! command -v node &> /dev/null; then
        echo -e "${RED}Node.jsがインストールされていません${NC}"
        echo ""
        echo "Node.js 18以上をインストールしてください:"
        echo "  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
        echo "  sudo apt-get install -y nodejs"
        exit 1
    fi

    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        error_exit "Node.js 18以上が必要です（現在: $(node -v)）"
    fi

    success_msg "Node.js $(node -v) 検出"
}

# システムパッケージのインストール
install_system_packages() {
    info_msg "システムパッケージを確認中..."

    # 必要なパッケージリスト
    PACKAGES="build-essential git"

    # パッケージが既にインストールされているかチェック
    MISSING_PACKAGES=""
    for pkg in $PACKAGES; do
        if ! dpkg -l | grep -q "^ii  $pkg"; then
            MISSING_PACKAGES="$MISSING_PACKAGES $pkg"
        fi
    done

    if [ -n "$MISSING_PACKAGES" ]; then
        info_msg "必要なパッケージをインストール中:$MISSING_PACKAGES"
        sudo apt-get update
        sudo apt-get install -y $MISSING_PACKAGES
        success_msg "システムパッケージのインストール完了"
    else
        success_msg "必要なパッケージは既にインストールされています"
    fi
}

# npm依存関係のインストール
install_npm_dependencies() {
    info_msg "npm依存関係をインストール中..."
    echo "  (これには数分かかる場合があります)"

    npm install || error_exit "npm install に失敗しました"

    success_msg "npm依存関係のインストール完了"
}

# アプリケーションのビルド
build_application() {
    info_msg "アプリケーションをビルド中..."
    echo "  (これには数分かかる場合があります)"

    npm run electron:build || error_exit "ビルドに失敗しました"

    success_msg "ビルド完了"
}

# 実行ファイルの権限設定
set_permissions() {
    info_msg "実行権限を設定中..."

    if [ -f "./release/linux-arm64-unpacked/raspi-gemini-chat" ]; then
        chmod +x ./release/linux-arm64-unpacked/raspi-gemini-chat
        success_msg "実行権限の設定完了"
    else
        echo -e "${YELLOW}警告: 実行ファイルが見つかりません${NC}"
    fi
}

# 設定ファイルの確認
check_env_file() {
    info_msg "設定ファイルを確認中..."

    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            echo -e "${YELLOW}→ .envファイルを作成しました${NC}"
            echo -e "${YELLOW}  Gemini API Keyはアプリの設定画面から入力できます${NC}"
        fi
    fi
}

# テスト起動の提案
suggest_test_run() {
    echo ""
    echo "======================================"
    success_msg "セットアップ完了！"
    echo "======================================"
    echo ""
    echo "次のステップ:"
    echo ""
    echo "1. アプリをテスト起動:"
    echo "   ./release/linux-arm64-unpacked/raspi-gemini-chat"
    echo ""
    echo "2. Gemini API Keyを取得:"
    echo "   https://makersuite.google.com/app/apikey"
    echo ""
    echo "3. アプリの設定画面でAPI Keyを入力"
    echo ""
    echo "4. 自動起動を設定（オプション）:"
    echo "   cd scripts"
    echo "   ./install-autostart.sh"
    echo ""
}

# 自動起動設定の確認
ask_autostart() {
    echo ""
    read -p "今すぐ自動起動を設定しますか？ (y/N): " setup_autostart

    if [[ $setup_autostart =~ ^[Yy]$ ]]; then
        echo ""
        cd scripts
        chmod +x install-autostart.sh
        ./install-autostart.sh
    else
        echo ""
        echo "後で設定する場合は以下を実行してください:"
        echo "  cd $(pwd)/scripts"
        echo "  ./install-autostart.sh"
    fi
}

# メイン処理
main() {
    # カレントディレクトリの確認
    if [ ! -f "package.json" ]; then
        error_exit "package.jsonが見つかりません。プロジェクトルートで実行してください。"
    fi

    check_nodejs
    install_system_packages
    install_npm_dependencies
    build_application
    set_permissions
    check_env_file
    suggest_test_run
    ask_autostart

    echo ""
    success_msg "すべて完了しました！"
    echo ""
}

# スクリプト実行
main
