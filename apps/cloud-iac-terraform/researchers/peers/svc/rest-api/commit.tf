# Define local variables
locals {
  commit_hash_file = "${path.module}/.commit_hash" # The file where the commit hash will be stored
}

# Fetch the current commit hash and write it to a file
resource "null_resource" "get_commit_hash" {
  provisioner "local-exec" {
    command = "git rev-parse HEAD > ${local.commit_hash_file}"
  }
}

# Read the commit hash from the file
data "local_file" "commit_hash" {
  filename   = local.commit_hash_file
  depends_on = [null_resource.get_commit_hash]
}

# Trim the commit hash and store it in a local variable (for use in cloud run)
locals {
  image_tag = trimspace(data.local_file.commit_hash.content)
}
