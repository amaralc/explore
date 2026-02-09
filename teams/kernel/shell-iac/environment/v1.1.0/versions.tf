terraform {
  required_version = ">= 1.1"

  # No required_providers at this level.
  # Cloud providers (neon, mongodbatlas) are declared in modules/cloud-resources/versions.tf.
  # Local providers (kubernetes, helm, null, tls) are declared in modules/local-iam/versions.tf.
  # Because sub-modules are called with count = 0/1, Terraform only requires the
  # providers for the path that is actually active.
}
