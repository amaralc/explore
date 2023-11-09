locals {
  logs = var.enabled ? var.log_map : {}
}

resource "null_resource" "logger_instance" {
  for_each = local.logs

  triggers = {
    timestamp = timestamp()
  }

  provisioner "local-exec" {
    command = <<EOF
echo "${timestamp()} - ${each.key}: ${each.value}" >> ${path.cwd}/insecure-local-debug.log
EOF
  }
}
