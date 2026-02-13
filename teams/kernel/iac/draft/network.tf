# VPC and Subnets
module "cs-vpc-prod-shared" {
  source  = "terraform-google-modules/network/google"
  version = "~> 5.0"

  project_id   = module.cs-vpc-host-prod-ha468-pm749.project_id
  network_name = "vpc-prod-shared"

  subnets = [
    {
      subnet_name           = "subnet-prod-1"
      subnet_ip             = "10.0.0.0/24"
      subnet_region         = "europe-west1"
      subnet_private_access = true
    },
    {
      subnet_name           = "subnet-prod-2"
      subnet_ip             = "10.0.1.0/24"
      subnet_region         = "us-east1"
      subnet_private_access = true
    },
  ]

}


# VPC and Subnets
module "cs-vpc-nonprod-shared" {
  source  = "terraform-google-modules/network/google"
  version = "~> 5.0"

  project_id   = module.cs-vpc-host-nonprod-ha468-pm749.project_id
  network_name = "vpc-nonprod-shared"

  subnets = [
    {
      subnet_name           = "subnet-non-prod-1"
      subnet_ip             = "10.0.0.0/24"
      subnet_region         = "europe-west1"
      subnet_private_access = true
    },
    {
      subnet_name           = "subnet-non-prod-2"
      subnet_ip             = "10.0.1.0/24"
      subnet_region         = "us-west1"
      subnet_private_access = true
    },
  ]

}


