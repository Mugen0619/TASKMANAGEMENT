# Amazon Linux 2023の最新AMIをSSMパラメータストア経由で取得する
# （AMI IDはリージョン・更新のたびに変わるため、直書きせずこの方法で常に最新を参照する）
data "aws_ssm_parameter" "al2023_ami" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64"
}

resource "aws_instance" "app" {
  ami                         = data.aws_ssm_parameter.al2023_ami.value
  instance_type               = var.instance_type
  subnet_id                   = aws_subnet.public.id
  vpc_security_group_ids      = [aws_security_group.app.id]
  key_name                    = aws_key_pair.app.key_name
  associate_public_ip_address = true

  root_block_device {
    volume_size = 8 # GB。無料利用枠の上限(30GB)に対して余裕を持たせつつ最小限に
    volume_type = "gp3"
  }

  user_data = templatefile("${path.module}/user_data.sh.tpl", {
    repo_url    = var.app_repo_url
    git_ref     = var.app_git_ref
    db_host     = aws_db_instance.postgres.address
    db_name     = var.db_name
    db_username = var.db_username
    db_password = random_password.rds_password.result
  })

  tags = {
    Name = "${var.project_name}-ec2"
  }
}
