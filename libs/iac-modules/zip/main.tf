resource "null_resource" "instance" {
  triggers = {
    always_run = "${timestamp()}"
  }

  provisioner "local-exec" {
    command = <<EOF
echo 'Navigate to directory...'
cd ${var.zip_input_path}

echo 'Zip content of current directory'
zip -r archive-${var.short_commit_sha}.zip .

echo 'Return to root folder'
cd -
EOF
  }
}

output "output_path" {
  value = "${var.zip_input_path}/archive-${var.short_commit_sha}.zip"
}
