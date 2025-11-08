# セキュリティに関する重要な注意事項

## APIキーの保護

このリポジトリは**Public**です。以下の点に十分注意してください：

### ⚠️ 絶対にやってはいけないこと

1. **APIキーをコードに直接書き込まない**
   ```typescript
   // ❌ ダメな例
   const apiKey = "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX"
   ```

2. **.envファイルをコミットしない**
   - `.env`ファイルは`.gitignore`に含まれています
   - 絶対にこのファイルをGitに追加しないでください

3. **スクリーンショットにAPIキーを含めない**
   - IssueやPRでスクリーンショットを共有する際は、APIキーが映り込んでいないか確認

### ✅ 安全な方法

#### 開発環境

APIキーは**アプリの設定画面から入力**してください：

1. アプリを起動
2. 右上の⚙️（設定）アイコンをクリック
3. "Gemini API Key" 欄にAPIキーを入力
4. "保存" をクリック

APIキーは**ブラウザのLocalStorage**に保存され、Gitには含まれません。

#### プロダクション環境

Raspberry Piでの運用時も、同様にアプリの設定画面からAPIキーを入力してください。

### .envファイルについて

`.env`ファイルはローカル開発用です：

```bash
# .envファイルを作成（.gitignoreに含まれているため、Gitには追加されません）
cp .env.example .env

# APIキーを設定（このファイルは絶対にコミットしないでください）
nano .env
```

### APIキーが漏洩した場合

もしAPIキーを誤ってコミットしてしまった場合：

1. **即座にGemini API Keyを無効化**
   - https://makersuite.google.com/app/apikey にアクセス
   - 漏洩したキーを削除
   - 新しいキーを生成

2. **Gitの履歴から削除**
   ```bash
   # 機密情報をGit履歴から完全に削除（注意して実行）
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all

   # 強制プッシュ（チーム開発の場合は要注意）
   git push origin --force --all
   ```

3. **GitHubに報告**
   - GitHubのSecretスキャンが検出した場合、通知が来ることがあります

## その他のセキュリティベストプラクティス

### Raspberry Piでの運用

1. **デフォルトパスワードの変更**
   ```bash
   passwd
   ```

2. **SSHの設定**
   - 公開鍵認証を使用
   - パスワード認証を無効化

3. **ファイアウォールの設定**
   ```bash
   sudo apt-get install ufw
   sudo ufw enable
   ```

4. **自動アップデート**
   ```bash
   sudo apt-get update
   sudo apt-get upgrade
   ```

### LocalStorageのデータ

アプリはLocalStorageに以下を保存します：

- APIキー
- チャット履歴
- 設定（Temperature、Max Tokensなど）

これらは**ローカルのブラウザ**にのみ保存され、外部には送信されません。

## 脆弱性の報告

セキュリティ上の問題を発見した場合は、Publicなissueではなく、リポジトリオーナーに直接連絡してください。

## 参考リンク

- [Gemini API - Best Practices](https://ai.google.dev/docs/gemini_api_overview)
- [GitHub - Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [OWASP - API Security](https://owasp.org/www-project-api-security/)
