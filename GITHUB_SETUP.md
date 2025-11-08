# GitHubへのアップロード手順

このガイドでは、プロジェクトをGitHubにアップロードし、Raspberry Piからcloneできるようにする手順を説明します。

## ステップ1: GitHubリポジトリを作成

1. https://github.com にアクセスしてログイン
2. 右上の「+」ボタンから「New repository」を選択
3. リポジトリ情報を入力：
   - **Repository name**: `PiChat` (この例では既に作成済み)
   - **Description**: `Gemini AI Chat App optimized for 1920x515 display on Raspberry Pi`
   - **Public / Private**: Public（この例ではPublic）
   - **Initialize this repository with**: チェックを入れない（既にローカルにファイルがあるため）
4. 「Create repository」をクリック

**このプロジェクトでは既にhttps://github.com/Koki-dec/PiChatが使用されています。**

## ステップ2: ローカルリポジトリをGitHubにプッシュ

GitHubで作成したリポジトリのURLをコピーして、以下のコマンドを実行：

```bash
cd /Users/kt/Documents/ai-chat

# リモートリポジトリを追加（この例ではKoki-dec/PiChat）
git remote add origin https://github.com/Koki-dec/PiChat.git

# プッシュ
git push -u origin main
```

**この例ではhttps://github.com/Koki-dec/PiChatを使用しています。**

### SSHを使用する場合

SSHキーを設定済みの場合：

```bash
git remote add origin git@github.com:Koki-dec/PiChat.git
git push -u origin main
```

## ステップ3: プッシュの確認

ブラウザでGitHubリポジトリを開いて、ファイルが正しくアップロードされているか確認：

- `README.md` が表示される
- `src/`, `electron/`, `scripts/` などのディレクトリが見える
- `setup-raspi.sh` が存在する

## ステップ4: README.mdのリポジトリURLを更新

GitHubリポジトリが作成できたら、README.mdとQUICK_START.mdのプレースホルダーを実際のURLに更新：

```bash
# README.mdを編集
nano README.md
# <YOUR_REPOSITORY_URL> を実際のURLに置き換え
# 例: https://github.com/YOUR_USERNAME/raspi-gemini-chat.git

# QUICK_START.mdを編集
nano QUICK_START.md
# <YOUR_REPOSITORY_URL> を実際のURLに置き換え

# 変更をコミット
git add README.md QUICK_START.md
git commit -m "Update repository URL in documentation"
git push
```

## ステップ5: Raspberry Piからクローン

これでRaspberry Piからリポジトリをcloneできます：

```bash
# Raspberry Piで実行
cd ~
git clone https://github.com/Koki-dec/PiChat.git ai-chat
cd ai-chat
chmod +x setup-raspi.sh
./setup-raspi.sh
```

## プライベートリポジトリの場合

リポジトリをPrivateにした場合、Raspberry Piからcloneする際に認証が必要です：

### 方法1: Personal Access Token（推奨）

1. GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token" をクリック
3. `repo` にチェックを入れる
4. トークンを生成してコピー

Raspberry Piでcloneする際：

```bash
git clone https://YOUR_TOKEN@github.com/Koki-dec/PiChat.git ai-chat
```

**注意: このリポジトリはPublicなので、通常は認証不要です。**

### 方法2: SSH Key

Raspberry PiにSSHキーを設定：

```bash
# Raspberry Piで実行
ssh-keygen -t ed25519 -C "your_email@example.com"
cat ~/.ssh/id_ed25519.pub
```

表示された公開鍵をGitHub Settings → SSH and GPG keys に追加

その後、SSH URLでclone：

```bash
git clone git@github.com:Koki-dec/PiChat.git ai-chat
```

## トラブルシューティング

### `git push` で認証エラー

GitHubのパスワード認証は廃止されています。Personal Access Tokenを使用してください：

```bash
# 認証情報を再設定
git remote set-url origin https://YOUR_TOKEN@github.com/Koki-dec/PiChat.git
git push -u origin main
```

### ファイルサイズエラー

大きなファイル（100MB以上）がある場合、Git LFSが必要です：

```bash
# Git LFSをインストール
brew install git-lfs  # macOS
# または
sudo apt-get install git-lfs  # Linux

# 初期化
git lfs install

# 大きなファイルをトラック
git lfs track "*.bin"
git add .gitattributes
git commit -m "Add Git LFS tracking"
git push
```

## 完了！

これでGitHubにプロジェクトがアップロードされ、Raspberry Piからいつでもcloneできるようになりました。

次のステップ：
1. Raspberry PiでQUICK_START.mdの手順に従ってセットアップ
2. 動作確認
3. 自動起動設定
