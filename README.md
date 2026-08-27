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
├── backend/                 # バックエンドAPI（Java + Spring Boot）
│   └── Dockerfile           # 本番用（EC2上でのビルド・起動）
├── frontend/                # フロントエンド（React + TypeScript + Vite）
│   ├── Dockerfile           # 本番用（nginxで静的配信 + /apiをbackendへプロキシ）
│   └── nginx.conf
├── docs/                    # 要件定義・設計ドキュメント
├── infra/                   # AWSインフラのTerraformコード（IaC）
├── docker-compose.yml       # ローカル開発用（PostgreSQLのみ）
└── docker-compose.prod.yml  # 本番用（EC2上でbackend/frontendをまとめて起動。DBはRDSを利用するためpostgresは含まない）
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

## AWSへのデプロイ

学習目的で、AWS無料利用枠に収まるシンプルな構成でAWS上にデプロイしている。構築はすべてAWS CLI・Terraform（IaC）で行い、マネジメントコンソールでの手動操作は最小限（IAMユーザーのアクセスキー発行のみ）にしている。

### アーキテクチャ概要

EC2インスタンス1台の中でfrontend/backendの2コンテナをDocker Composeで動かし、DB（PostgreSQL）だけはAWSのマネージドDBサービスRDSに切り出している。

```
[ブラウザ] --HTTP(80)--> [EC2インスタンス (t3.micro, パブリックサブネット)]
                            └─ Docker Compose
                               ├─ frontend (nginx) :80 ── 静的ファイル配信 + /api を backend へリバースプロキシ
                               └─ backend (Spring Boot) :8080 ── frontendコンテナからのみアクセス可能
                                     │
                                     │ 5432 (RDSのSGでEC2のSGからのみ許可)
                                     ▼
                          [RDS PostgreSQL (db.t4g.micro, プライベートサブネット×2AZ)]
                          publicly_accessible = false（自分のPC等、外部からは接続不可）
```

- リージョン: 東京（ap-northeast-1）
- ネットワーク: 専用VPC（10.0.0.0/16）。EC2用のパブリックサブネット1つ + RDS用のプライベートサブネット2つ（異なるAZ、RDSのDBサブネットグループの要件のため）+ Internet Gateway
- セキュリティグループ: EC2はSSH(22)を自分のIPのみ・HTTP(80)を全体に許可。RDSは5432番ポートをEC2のセキュリティグループからのみ許可（自分のPCなど他からは一切接続不可）
- RDSはMulti-AZ構成にはせず、無料利用枠を優先したシングル構成
- 独自ドメイン・HTTPS化・CI/CD自動化・高可用性構成は今回のスコープ外（AWSが発行するパブリックIPで公開）

### 使用しているTerraformリソース（`infra/`）

| ファイル | 内容 |
|---|---|
| `network.tf` | VPC・パブリック/プライベートサブネット・Internet Gateway・ルートテーブル |
| `security_group.tf` | EC2用ファイアウォール（SSHは自分のIPのみ、HTTPは全体） |
| `rds.tf` | RDS(PostgreSQL)本体、DBサブネットグループ、RDS用セキュリティグループ（EC2のSGからのみ許可）、マスターパスワードの自動生成 |
| `key_pair.tf` | SSH接続用の鍵ペアを新規生成（秘密鍵はローカルの`infra/generated/`に保存、Git管理外） |
| `ec2.tf` | EC2インスタンス本体。起動時にuser_data（`user_data.sh.tpl`）でDocker環境構築・アプリのclone・起動までを自動実行（RDSのエンドポイントを`.env`に埋め込む） |
| `budget.tf` | AWS Budgets。月額コストが50%/100%を超える（超えそうになる）とメール通知 |

### デプロイ手順

1. AWS CLIの認証設定（IAMユーザーのアクセスキーを発行し、`aws configure` で設定。ルートユーザーのアクセスキーは使用しない）
2. `infra/terraform.tfvars.example` を `infra/terraform.tfvars` にコピーし、自分のグローバルIP（`https://checkip.amazonaws.com` で確認）と通知先メールアドレスを設定（このファイルはGit管理外）
3. `infra/` ディレクトリで以下を実行

   ```bash
   cd infra
   terraform init
   terraform plan
   terraform apply
   ```

4. `terraform apply` の出力（`app_url`）に表示されるURLにブラウザでアクセスすると、アプリが利用できる

EC2の起動時（user_data）にDockerのインストール・リポジトリのclone・`docker compose -f docker-compose.prod.yml up -d --build` までを自動実行するため、apply後しばらく（目安5〜10分程度）待つとアプリが起動する。

### コスト面の注意

- EC2（t3.micro、750時間/月）・EBS（8GB）・RDS（db.t4g.micro、750時間/月、ストレージ20GB）は、いずれも無料利用枠の対象であれば範囲内。**ただしアカウントによっては無料利用枠の対象外の場合があるため、AWS請求コンソールの「Free Tier」ページで事前に確認することを推奨**
- 2024年2月のAWS料金改定により、**パブリックIPv4アドレスはEC2起動中は無料利用枠の対象外で $0.005/時間 課金される**（Elastic IPも同様）。RDSは`publicly_accessible = false`のためこの課金対象外
- 使わない時はEC2・RDSともに停止できる（`aws ec2 stop-instances` / `aws rds stop-db-instance`）。ただし**RDSは停止しても7日後にAWSが自動的に再起動する仕様**のため、長期間停止したい場合は定期的に再度停止するか、`terraform destroy`で削除する
- `terraform destroy` でインフラ一式を削除できる（学習が終わったら忘れずに削除する）

### 再デプロイ（コード変更後）

CI/CDは今回のスコープ外のため、コード変更後は手動でEC2にSSH接続し、再デプロイする。

```bash
ssh -i infra/generated/taskmanagement-key.pem ec2-user@<EC2のパブリックIP>
cd /opt/app
git pull
sudo docker compose -f docker-compose.prod.yml up -d --build
```
