# Generate a random ID with the random_id resource. This ID will be used as prefix to create a unique project ID for the new GCP project.
resource "random_id" "instance" {
  byte_length = 8
}

# The null_resource with lifecycle block and ignore_changes argument is used to ensure that the random ID does not change in subsequent runs.
resource "null_resource" "ignore_id_changes" {
  triggers = {
    id = random_id.instance.hex
  }

  lifecycle {
    ignore_changes = [
      triggers,
    ]
  }
}

output "instance" {
  value = substr(random_id.instance.hex, 0, 4)
}
