variable "aws_region" {
  description = "リソースを作成するAWSリージョン"
  type        = string
  default     = "ap-northeast-1"
}

variable "project_name" {
  description = "リソース名のプレフィックスに使うプロジェクト名"
  type        = string
  default     = "taskmanagement"
}

variable "instance_type" {
  description = "EC2インスタンスタイプ（無料利用枠対象の t3.micro を推奨）"
  type        = string
  default     = "t3.micro"
}

variable "my_ip_cidr" {
  description = "SSH(22番ポート)接続を許可する自分のグローバルIP（CIDR形式、例: 203.0.113.10/32）。https://checkip.amazonaws.com で確認できる"
  type        = string
}

variable "db_name" {
  description = "PostgreSQLのデータベース名"
  type        = string
  default     = "taskmanagement"
}

variable "db_username" {
  description = "PostgreSQLの接続ユーザー名"
  type        = string
  default     = "postgres"
}

variable "app_repo_url" {
  description = "EC2上にcloneするGitリポジトリのURL（Publicリポジトリなので認証情報は不要）"
  type        = string
  default     = "https://github.com/Mugen0619/TASKMANAGEMENT.git"
}

variable "app_git_ref" {
  description = "EC2上でcloneするブランチ名"
  type        = string
  default     = "master"
}

variable "budget_alert_email" {
  description = "AWS Budgetsのアラート通知先メールアドレス"
  type        = string
}

variable "budget_limit_usd" {
  description = "月間コストの想定上限（USD）。これを超えたら（または超えそうになったら）メール通知する"
  type        = number
  default     = 5
}
