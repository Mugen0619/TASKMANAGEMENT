---
name: quality-check
description: バックエンド(backend/)・フロントエンド(frontend/)のCRUD実装に対して、ドキュメント整合性・デファクトスタンダード準拠・Lintの3観点で品質チェックを行う手順。「品質チェックして」「レビューして」「ドキュメントと実装が合っているか確認して」など、機能実装がひと区切りついたタイミングで使う。
---

# 実装の品質チェック

要件定義書・設計書と実装内容にズレがないか、Reactやspring Bootの標準的な書き方から外れていないかを確認する。以下の3観点で行う。

## 観点1: ドキュメント整合性チェック

以下のドキュメントと実装(`backend/`, `frontend/`)を突き合わせ、実装漏れ・食い違いを洗い出す。

- `docs/requirements.md` — 機能要件、4.2の実装状況テーブル
- `docs/screen-design.md` — 画面レイアウト・操作フロー
- `docs/data-design.md` — データの形・API方針
- `docs/tech-stack.md` — 技術スタックのバージョン(`frontend/package.json`・`package-lock.json`、`backend/build.gradle`、`backend/gradle/wrapper/gradle-wrapper.properties`と突き合わせる)

チェック方法:
1. `docs/requirements.md` の機能要件一覧を1件ずつ、対応するAPI(`backend/src/main/java/.../task/TaskController.java`)とフロント実装(`frontend/src/`)が揃っているか確認する
2. 4.2の実装状況テーブルが実際のコードと一致しているか確認する(古いまま放置されやすい箇所)
3. `docs/screen-design.md` のワイヤーフレーム・操作説明と、実際の画面(コンポーネント構成)を見比べる
4. `docs/data-design.md` のAPIエンドポイント例・データ形が実装と一致しているか確認する

## 観点2: デファクトスタンダード整合性チェック

Claude Codeの `/code-review` コマンドを使い、変更差分を確認する(`/code-review` は差分ベースのレビューのため、差分がない既存コード全体を見る場合は該当ファイルを直接読んで確認する)。

確認する主なポイント:
- **フロントエンド(React)**: 関数コンポーネント+フックで書かれているか、`useEffect`の依存配列が適切か、propsの型定義があるか、不要な再レンダリングを招く実装がないか
- **バックエンド(Spring Boot)**: コンストラクタインジェクションを使っているか、リクエスト/レスポンスの型が明確か(record等)、バリデーションが適切か、レイヤ構成(Controller/Service/Repository)が過不足なく実装規模に見合っているか

## 観点3: Lintチェック

- フロントエンド: `frontend/` で `npm run lint` を実行する(ESLint、`frontend/eslint.config.js`)
- バックエンド: `backend/` で `./gradlew checkstyleMain checkstyleTest` を実行する(Checkstyle、`backend/config/checkstyle/checkstyle.xml`)

どちらもエラー・警告が出た場合は、原則その場で修正する。

## 見つかった問題への対応方針

- **ドキュメントと実装が食い違っている場合**: 原則ドキュメント側を正しい設計として、実装をドキュメントに合わせて修正する
- **ドキュメント側が明らかに古い・誤っていると判断した場合**(例: 直近の意図的な実装変更が反映されていない等): 実装を変更せず、その旨をユーザーに報告して判断を仰ぐ。ドキュメントを直接書き換えて済ませない
- **デファクトスタンダードからの逸脱**: 明確な不具合や修正が容易なものはその場で直す。設計判断が絡むもの(レイヤ構成の追加など)は、報告した上でユーザーの判断を仰ぐ

## 完了条件

- ドキュメントと実装の食い違い一覧(対応済み/要判断)が明確になっている
- `npm run lint` / `./gradlew checkstyleMain checkstyleTest` がいずれもエラーなしで通る
- UIに影響する修正は、実際にサーバーを起動してブラウザ上で動作確認する(サーバー起動は `dev-server-port-conflict` Skillを参照)
