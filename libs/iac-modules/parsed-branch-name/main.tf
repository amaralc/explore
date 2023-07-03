data "external" "parse_branch_name" {
  program = ["bash", "-c", "branch_name='${var.branch_name}'; parsed_branch_name=$(echo \"$branch_name\" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g'); echo \"{\\\"parsed_branch_name\\\": \\\"$parsed_branch_name\\\"}\""]
}

# The null_resource with lifecycle block and ignore_changes argument is used to ensure that the parsed branch name does not change in subsequent runs.
resource "null_resource" "ignore_branch_name_changes" {
  triggers = {
    parsed_branch_name = data.external.parse_branch_name.result["parsed_branch_name"]
  }

  lifecycle {
    ignore_changes = [
      triggers,
    ]
  }
}

# Output the fixed parsed branch name
output "instance" {
  value = null_resource.ignore_branch_name_changes.triggers["parsed_branch_name"]
}
