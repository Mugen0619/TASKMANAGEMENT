# TASKMANAGEMENT

Trello風タスク管理アプリ。付箋（カード）形式でタスクを管理する、シンプルなカンバン方式のタスク管理アプリです。

スクールの課題として、システム開発の一連の流れ（要件定義 → 設計 → 実装 → テスト → リリース）を学ぶこと、およびAIと協働してアプリを開発する進め方を学習することを目的としています。実務で使われる小規模開発を想定し、必要最小限の機能に絞って構築しています。

## 技術スタック

| 区分 | 技術 |
|---|---|
| フロントエンド | React（TypeScript + Vite） |
| バックエンド | Java + Spring Boot |
| データベース | PostgreSQL（Docker） |

このプロジェクトはスクールの学習課題であり、Java・Spring Boot・Reactの組み合わせで開発することが課題として指定されています。バージョンなどの詳細は [docs/tech-stack.md](docs/tech-stack.md) を参照してください。

## ディレクトリ構成

```
TASKMANAGEMENT/
├── backend/           # バックエンドAPI（Java + Spring Boot）
├── frontend/          # フロントエンド（React + TypeScript + Vite）
├── docs/              # 要件定義・設計ドキュメント
└── docker-compose.yml # PostgreSQLをDockerで起動するための設定
```

## ドキュメント

- [要件定義書](docs/requirements.md) — アプリの概要・機能要件・非機能要件・スコープ
- [画面設計](docs/screen-design.md) — ユースケース図・画面レイアウト
- [データ設計](docs/data-design.md) — タスクのデータ形式・保存方針
- [技術スタック](docs/tech-stack.md) — 使用技術とバージョン、採用理由

## ローカルでの起動方法

### 1. データベース（PostgreSQL）を起動

リポジトリ直下で実行します。

```bash
docker compose up -d
```

### 2. バックエンド（Spring Boot）を起動

```bash
cd backend
./gradlew bootRun       # Windowsは gradlew.bat bootRun
```

`http://localhost:8080` で起動します（ポートは8080に固定。`backend/src/main/resources/application.properties` の `server.port=8080` による設定）。

### 3. フロントエンド（React）を起動

```bash
cd frontend
npm install
npm run dev
```

`http://localhost:5173` で起動します（ポートは5173に固定。`frontend/vite.config.ts` の `strictPort: true` による設定）。

いずれもポートが競合して起動できない場合は、別ポートへは逃げず、使用中のプロセスを確認・停止してから指定ポートで起動し直してください。
