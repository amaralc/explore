
# Parse the branch name to a string that uses lowercase letters, starts with a letter, and replaces special characters with a hyphen
locals {
  branch_name_base64_sha256 = base64sha256(var.branch_name)
  branch_code_base64_sha256 = "b-${local.branch_name_base64_sha256}" # Many resources expect it to start with a letter
}

data "external" "parse_branch_code" {
  program = ["bash", "-c", "branch_code_base64_sha256='${local.branch_code_base64_sha256}'; environment_name=$(echo \"$branch_code_base64_sha256\" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g'); echo \"{\\\"environment_name\\\": \\\"$environment_name\\\"}\""]
}

# The null_resource with lifecycle block and ignore_changes argument is used to ensure that the parsed branch name does not change in subsequent runs.
resource "null_resource" "ignore_branch_code_changes" {
  triggers = {
    environment_name = data.external.parse_branch_code.result["environment_name"]
  }

  # Test the lifecycle block and ignore_changes argument
  lifecycle {
    ignore_changes = [
      triggers,
    ]
  }
}

resource "null_resource" "logger" {
  provisioner "local-exec" {
    command = "echo 'Environment name: ${local.environment_name}'"
  }
}

# Output the fixed parsed branch code
output "instance" {
  value = null_resource.ignore_branch_code_changes.triggers["environment_name"]
}
