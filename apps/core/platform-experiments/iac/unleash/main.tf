resource "unleash_api_token" "instance" {
  username    = "terraform-${var.environment_name}"
  type        = "admin"
  expires_at  = "2024-10-19"
  environment = "*"
  projects    = ["*"]
}
