#!/bin/bash
# EC2初回起動時に自動実行されるセットアップスクリプト（cloud-init user_data）。
# Docker・Docker Composeのインストール、アプリのclone、コンテナ起動までを行う。
set -eux

dnf update -y
dnf install -y docker git

systemctl enable --now docker
usermod -aG docker ec2-user

# Amazon Linux 2023のdnfリポジトリにはdocker-compose-pluginが無いため、
# 公式GitHub Releasesから "docker compose" プラグイン本体を直接取得する。
mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# t3.microはメモリが1GBしかなく、Spring Boot + PostgreSQL + フロントエンドの
# Dockerビルドでメモリ不足になりやすいため、スワップ領域を追加しておく。
fallocate -l 1G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

mkdir -p /opt/app
git clone --branch '${git_ref}' --depth 1 '${repo_url}' /opt/app
cd /opt/app

cat > .env <<EOF
POSTGRES_DB=${db_name}
POSTGRES_USER=${db_username}
POSTGRES_PASSWORD=${db_password}
EOF
chmod 600 .env

docker compose -f docker-compose.prod.yml up -d --build
