# RDSは（シングルAZ構成でも）異なるAZのサブネットを2つ以上含む
# 「DBサブネットグループ」の指定が必須。EC2のパブリックサブネットとは分離した
# プライベートサブネット(network.tf)を使う。
resource "aws_db_subnet_group" "postgres" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = [aws_subnet.private_a.id, aws_subnet.private_c.id]

  tags = {
    Name = "${var.project_name}-db-subnet-group"
  }
}

# RDS用のファイアウォール。EC2のセキュリティグループからの5432番ポートのみ許可し、
# 自分のPCなど他の場所からは一切接続できないようにする。
resource "aws_security_group" "rds" {
  name        = "${var.project_name}-rds-sg"
  description = "Allow PostgreSQL access from the EC2 app instance only"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "PostgreSQL from EC2"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-rds-sg"
  }
}

# RDSのマスターパスワードを自動生成する
resource "random_password" "rds_password" {
  length  = 24
  special = false
}

resource "aws_db_instance" "postgres" {
  identifier     = "${var.project_name}-db"
  engine         = "postgres"
  engine_version = "16"           # docker-compose.ymlの postgres:16 に合わせる（マイナーバージョンはAWSが自動選択）
  instance_class = "db.t4g.micro" # 無料利用枠対象、Multi-AZは対象外（シングル構成）

  allocated_storage = 20 # GB。RDS無料利用枠の上限
  storage_type      = "gp2"
  storage_encrypted = true

  db_name  = var.db_name
  username = var.db_username
  password = random_password.rds_password.result

  db_subnet_group_name   = aws_db_subnet_group.postgres.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false # 自分のPC等、外部からは一切接続不可にする
  multi_az               = false

  backup_retention_period = 1
  skip_final_snapshot     = true # 学習用のため、destroy時にスナップショットを残さない
  deletion_protection     = false
  apply_immediately       = true

  tags = {
    Name = "${var.project_name}-db"
  }
}
