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
      echo "Logging key value pairs..."
      if [ "${var.log_to_file}" = "true" ]; then
        echo "${timestamp()} - ${each.key}: ${each.value}" >> ${path.cwd}/insecure-local-debug.log
      else
        echo "${timestamp()} - ${each.key}: ${each.value}"
      fi
    EOF
  }
}
