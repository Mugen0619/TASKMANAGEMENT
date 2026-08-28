# EC2に対するファイアウォール（どこからどのポートへの通信を許可するか）。
# SSH(22)は自分のIPだけに限定し、HTTP(80)はアプリを公開するため全体に許可する。
# DB(5432)はRDS側のセキュリティグループ（rds.tf）で、このSG(EC2)からの通信のみ許可しており、
# このSG自体には5432番の受信ルールは持たせない。
resource "aws_security_group" "app" {
  name        = "${var.project_name}-sg"
  description = "Allow SSH from my IP only, and HTTP from anywhere"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "SSH from my IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.my_ip_cidr]
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-sg"
  }
}
