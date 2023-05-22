```
# terraform {
#   backend "gcs" {
#     bucket = "peerlab-terraform-state"
#     prefix = "terraform/state"
#     # Filename relative to terraform folder
#     credentials = "credentials.json"
#   }
# }

# # Configure the Fly provider
# provider "fly" {
#   useinternaltunnel    = true
#   internaltunnelorg    = "personal"
#   internaltunnelregion = "gru"
#   fly_api_token        = var.fly_api_token
# }


# locals {
#   commit_hash_file = "${path.module}/.commit_hash"
# }

# resource "null_resource" "get_commit_hash" {
#   provisioner "local-exec" {
#     command = "git rev-parse --short HEAD > ${local.commit_hash_file}" // TODO: Use full commit hash?
#   }
# }

# data "local_file" "commit_hash" {
#   filename   = local.commit_hash_file
#   depends_on = [null_resource.get_commit_hash]
# }

# locals {
#   app_name  = "micro-applications-template-rest-api"
#   image_tag = trimspace(data.local_file.commit_hash.content)
# }

# # Create a Fly.io application
# resource "fly_app" "micro_app_rest_api" {
#   # Create the fly app named "micro-applications-template-rest-api"
#   name = local.app_name
#   org  = "personal"
# }

# # Configure app secrets
# resource "null_resource" "set_fly_secrets" {
#   provisioner "local-exec" {
#     command = <<EOF
#       echo "Commit hash:"
#       echo ${local.commit_hash_file}
#       echo "Settings fly secrets..."
#       cd ../service-rest-api/
#       fly secrets set DATABASE_URL=${var.database_url}
#       fly secrets set DIRECT_URL=${var.direct_url}
#     EOF
#   }
#   depends_on = [fly_app.micro_app_rest_api]
# }

# # Configure ip v4 address
# resource "fly_ip" "ip_v4" {
#   app        = local.app_name
#   type       = "v4"
#   depends_on = [fly_app.micro_app_rest_api]
# }

# # Configure ip v6 addressapp_name
# resource "fly_ip" "ip_v6" {
#   app        = local.app_name
#   type       = "v6"
#   depends_on = [fly_app.micro_app_rest_api]
# }

# # Build image from Dockerfile
# resource "null_resource" "build_and_push_docker_image" {
#   triggers = {
#     dockerfile_content = filesha256("${path.module}/../service-rest-api/Dockerfile")
#   }

#   provisioner "local-exec" {
#     command = <<EOF
#       cd ../../ &&
#       flyctl auth docker &&
#       docker build -t registry.fly.io/${local.app_name}:${local.image_tag} -f apps/researchers/peers/svc/Dockerfile . &&
#       docker push registry.fly.io/${local.app_name}:${local.image_tag}
#     EOF
#   }
# }

# # Update machine metadata to use fly platform v2
# resource "null_resource" "update_unmanaged_machines" {
#   triggers = {
#     image_tag = local.image_tag
#   }

#   provisioner "local-exec" {
#     command = <<EOF
#       for machine_id in $(fly machine list --json | jq -r '.[] | select(.metadata.fly_platform_version != "v2") | .id'); do
#         fly machine update --metadata fly_platform_version=v2 $machine_id
#       done
#     EOF
#   }
# }

# # Create and run machine with that image
# resource "fly_machine" "micro_app_machine_01" {
#   // Regions where the app will be deployed
#   for_each = toset(
#     [
#       "gru", // Sao Paulo
#       "gig"  // Rio de Janeiro
#     ]
#   )
#   app    = local.app_name
#   region = each.value
#   name   = "${local.app_name}-${each.value}"
#   image  = "registry.fly.io/${local.app_name}:${local.image_tag}"
#   # env = {
#   #   DATABASE_PROVIDER = "value"
#   # }
#   services = [
#     {
#       ports = [
#         {
#           port     = 443
#           handlers = ["tls", "http"]
#         },
#         {
#           port     = 80
#           handlers = ["http"]
#         }
#       ]
#       "protocol" : "tcp",
#       "internal_port" : 8080
#     },
#   ]
#   cpus       = 1
#   memorymb   = 256
#   depends_on = [fly_app.micro_app_rest_api, null_resource.build_and_push_docker_image, null_resource.update_unmanaged_machines]
# }
```
