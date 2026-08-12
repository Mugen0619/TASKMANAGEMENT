# 技術スタック：Trello風タスク管理アプリ

[requirements.md](requirements.md) を実現するための技術構成。

## 構成

| 区分 | 技術 | 備考 |
|---|---|---|
| フロントエンド | React | Next.js（Reactを拡張したフレームワーク）は今回対象外。素のReactで構築する |
| バックエンド | Java + Spring Boot | 画面（React）からのリクエストを受けてデータを処理する、REST API（ブラウザとサーバーがデータをやり取りするための決まりごと）を提供する |
| データベース | PostgreSQL（ポストグレスキューエル） | タスクデータを保存する場所。Docker（環境をパッケージ化し、手元のPCで同じ動作環境を簡単に立ち上げられる仕組み）を使って用意する |

## なぜこの構成にしたか

このプロジェクトはスクールの学習課題であり、Java・Spring Boot・Reactの組み合わせで開発することが課題として指定されているため、この技術スタックを採用する（[requirements.md](requirements.md) 2章「背景・目的」参照）。技術そのものを比較検討する場ではなく、指定された構成で要件定義→設計→実装→テスト→リリースの一連の流れを経験することが目的。

## 全体像（イメージ）

```
[ブラウザ (React)]  --HTTP(REST API)-->  [Spring Boot]  -->  [PostgreSQL (Docker)]
```

ブラウザ（React）・バックエンドAPI（Spring Boot）・データベース（PostgreSQL）の3層構成。[requirements.md](requirements.md) 5章の非機能要件にあるとおり、タスクデータはブラウザのlocalStorageではなく、バックエンドAPI経由でPostgreSQLに保存する。
