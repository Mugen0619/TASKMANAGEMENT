# GitHub ワークフロールール(厳守)

このプロジェクトでは以下のワークフローを必ず守ること。ユーザーが明示的に例外を指示した場合を除き、逸脱しない。

## 1. 作業開始前に必ずIssueを作成する
- 新しい実装・修正・改善に着手する前に、`gh issue create` でGitHub Issueを作成する。
- Issueには背景・目的、やること、完了条件を書く(`.github/ISSUE_TEMPLATE/task.yml` のフォーマットに従う)。

## 2. 必ずIssueに対応するブランチを作成する
- `master` の最新状態からブランチを切る。
- 命名規則: `type/issue番号-slug`
  - type: `feature`(機能追加), `fix`(バグ修正), `docs`(ドキュメント), `chore`(雑務), `refactor`(リファクタリング), `test`(テスト)
  - 例: `feature/12-add-login`, `fix/15-fix-login-bug`

## 3. `master` への直接コミット・プッシュは禁止
- GitHub側のブランチ保護で技術的にブロックされている(管理者含む)。
- 必ずfeatureブランチ → Pull Request経由で `master` にマージする。
- `master` に対して直接 `git commit` / `git push` を行おうとした場合は中断し、ユーザーに確認する。

## 4. Pull Requestの作成とIssueの紐付け
- PR本文に `Closes #<issue番号>` を記載し、マージ時にIssueが自動クローズされるようにする(`.github/PULL_REQUEST_TEMPLATE.md` を使用)。
- PRのマージはユーザーの明示的な承認を得てから行う。自動マージはしない。

## 5. コミットメッセージ
- 日本語で、変更内容が要約できる簡潔な文にする(既存の慣習に合わせる)。

## 6. サーバー起動時のポート運用ルール
- バックエンド(Spring Boot)は必ず **8080番ポート** で起動する。`backend/src/main/resources/application.properties` に `server.port=8080` を明記している。
- フロントエンド(Vite)は必ず **5173番ポート** で起動する。`frontend/vite.config.ts` に `server: { port: 5173, strictPort: true }` を設定しており、ポートが使用中の場合は別ポートへ自動切り替えせずエラーで停止する。
- ポート競合でサーバーが起動できない場合、**別のポートに逃げてはいけない**。以下の手順で対応すること。
  1. 指定ポートを使用しているプロセスを確認する
  2. そのプロセスを停止する
  3. 改めて指定ポート(バックエンド8080/フロントエンド5173)で起動し直す

### ポート使用中プロセスの確認・停止手順(Windows)

PowerShellの場合:
```powershell
# ポートを使用しているプロセスIDを確認して停止する(例: 8080番の場合)
Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess
Stop-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess -Force
```

コマンドプロンプト/Git Bashの場合:
```
netstat -ano | findstr :8080
taskkill /PID <上記で確認したPID> /F
```

フロントエンド(5173番)の場合は、上記コマンドの `8080` を `5173` に置き換えて実行する。
