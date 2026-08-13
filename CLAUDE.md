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
