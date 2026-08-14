# 技術スタック：Trello風タスク管理アプリ

[requirements.md](requirements.md) を実現するための技術構成。

## 構成

| 区分 | 技術 | バージョン | 備考 |
|---|---|---|---|
| フロントエンド | React | 19.2.8 | Next.js（Reactを拡張したフレームワーク）は今回対象外。素のReactで構築する |
| フロントエンド | TypeScript | 5.7.3 | 型（データの種類）を付けてJavaScriptを書けるようにする言語 |
| フロントエンド | Vite（ヴィート） | 6.4.3 | 開発サーバー起動・ビルドを行うツール |
| バックエンド | Java | 25 | Spring Bootを動かすプログラミング言語（Gradleのtoolchain設定で指定） |
| バックエンド | Spring Boot | 4.1.0 | 画面（React）からのリクエストを受けてデータを処理する、REST API（ブラウザとサーバーがデータをやり取りするための決まりごと）を提供する |
| バックエンド | Gradle（グレードル） | 9.5.1 | バックエンドのビルドツール（依存ライブラリの取得やビルド・実行を行う仕組み）。プロジェクト同梱のGradle Wrapperで固定 |
| データベース | PostgreSQL（ポストグレスキューエル） | 16 | タスクデータを保存する場所。Docker（環境をパッケージ化し、手元のPCで同じ動作環境を簡単に立ち上げられる仕組み）のコンテナとして用意する（`docker-compose.yml`） |

バージョンの確認元：`frontend/package.json`（package-lock.jsonでの確定版）、`backend/build.gradle`、`backend/gradle/wrapper/gradle-wrapper.properties`、`docker-compose.yml`。

## なぜこの構成にしたか

このプロジェクトはスクールの学習課題であり、Java・Spring Boot・Reactの組み合わせで開発することが課題として指定されているため、この技術スタックを採用する（[requirements.md](requirements.md) 2章「背景・目的」参照）。技術そのものを比較検討する場ではなく、指定された構成で要件定義→設計→実装→テスト→リリースの一連の流れを経験することが目的。

## 全体像（イメージ）

```
[ブラウザ (React)]  --HTTP(REST API)-->  [Spring Boot]  -->  [PostgreSQL (Docker)]
```

ブラウザ（React）・バックエンドAPI（Spring Boot）・データベース（PostgreSQL）の3層構成。[requirements.md](requirements.md) 5章の非機能要件にあるとおり、タスクデータはブラウザのlocalStorageではなく、バックエンドAPI経由でPostgreSQLに保存する。
