# このプロジェクト専用の最小構成VPC。
# アカウントのデフォルトVPCには依存せず、Terraformだけで完結して作成・削除できるようにする。
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "${var.project_name}-vpc"
  }
}

# パブリックサブネット（EC2を1台だけ置くので1つで十分）
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-public-subnet"
  }
}

# インターネットゲートウェイ（VPCとインターネットの出入り口）
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-igw"
  }
}

# 0.0.0.0/0 宛の通信をインターネットゲートウェイに向けるルートテーブル
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "${var.project_name}-public-rt"
  }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# RDS用のプライベートサブネット。
# RDSのDBサブネットグループは（シングルAZ構成でも）異なる2つのAZのサブネットが必須のため、
# EC2のパブリックサブネットとは別に、インターネットゲートウェイへのルートを持たない
# プライベートサブネットを2つのAZに用意する（ルートテーブルを関連付けないため、
# VPCのメインルートテーブル＝VPC内のみの通信になる）。
resource "aws_subnet" "private_a" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "${var.aws_region}a"

  tags = {
    Name = "${var.project_name}-private-subnet-a"
  }
}

resource "aws_subnet" "private_c" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.3.0/24"
  availability_zone = "${var.aws_region}c"

  tags = {
    Name = "${var.project_name}-private-subnet-c"
  }
}
