# Generate a random ID with the random_id resource. This ID will be used as prefix to create a unique project ID for the new GCP project.
resource "random_id" "instance" {
  prefix = "${var.environment_name_prefix}-"
  keepers = {
    # Generate a new id each time we switch to a new environment_name
    ami_id = var.environment_name_prefix
  }
  byte_length = 8
}

resource "null_resource" "log_random_id" {
  provisioner "local-exec" {
    command = "echo 'Env: ' ${random_id.instance.hex}"
  }
}

output "value" {
  description = "Environment name with prefix, random characters and less than 23 characters"
  value       = substr(random_id.instance.hex, 0, 23) # Name cannot have more than 23 characters (network resources have a 23 character limit)
}
