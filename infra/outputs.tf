output "app_url" {
  description = "アプリの公開URL（ブラウザでアクセスする）"
  value       = "http://${aws_instance.app.public_ip}"
}

output "ec2_public_ip" {
  description = "EC2のパブリックIPアドレス"
  value       = aws_instance.app.public_ip
}

output "ec2_public_dns" {
  description = "EC2のパブリックDNS名"
  value       = aws_instance.app.public_dns
}

output "ssh_command" {
  description = "EC2にSSH接続するコマンド"
  value       = "ssh -i ${local_sensitive_file.private_key.filename} ec2-user@${aws_instance.app.public_ip}"
}
