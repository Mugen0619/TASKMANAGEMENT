# SSH接続用の鍵ペアをTerraformで新規生成する。
# 秘密鍵はTerraformの状態ファイル(tfstate)とローカルファイルの両方に平文で残るため、
# tfstateとgenerated/ディレクトリは.gitignoreで確実に除外している。
resource "tls_private_key" "app" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "app" {
  key_name   = "${var.project_name}-key"
  public_key = tls_private_key.app.public_key_openssh

  tags = {
    Name = "${var.project_name}-key"
  }
}

# 秘密鍵をローカルファイルに保存する（0600権限、SSH接続時に使用）
resource "local_sensitive_file" "private_key" {
  content         = tls_private_key.app.private_key_pem
  filename        = "${path.module}/generated/${var.project_name}-key.pem"
  file_permission = "0600"
}
