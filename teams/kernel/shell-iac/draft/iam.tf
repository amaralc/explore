module "cs-folders-iam-0-computeinstanceAdminv1" {
  source  = "terraform-google-modules/iam/google//modules/folders_iam"
  version = "~> 7.4"

  folders = [
    module.cs-envs["kernel"].ids["non-production"],
  ]
  bindings = {
    "roles/compute.instanceAdmin.v1" = [
      "group:gcp-developers@hipeerlab.com",
    ]
  }
}

module "cs-folders-iam-0-containeradmin" {
  source  = "terraform-google-modules/iam/google//modules/folders_iam"
  version = "~> 7.4"

  folders = [
    module.cs-envs["kernel"].ids["non-production"],
  ]
  bindings = {
    "roles/container.admin" = [
      "group:gcp-developers@hipeerlab.com",
    ]
  }
}

module "cs-folders-iam-1-computeinstanceAdminv1" {
  source  = "terraform-google-modules/iam/google//modules/folders_iam"
  version = "~> 7.4"

  folders = [
    module.cs-envs["organizations"].ids["non-production"],
  ]
  bindings = {
    "roles/compute.instanceAdmin.v1" = [
      "group:gcp-developers@hipeerlab.com",
    ]
  }
}

module "cs-folders-iam-1-containeradmin" {
  source  = "terraform-google-modules/iam/google//modules/folders_iam"
  version = "~> 7.4"

  folders = [
    module.cs-envs["organizations"].ids["non-production"],
  ]
  bindings = {
    "roles/container.admin" = [
      "group:gcp-developers@hipeerlab.com",
    ]
  }
}

module "cs-folders-iam-2-computeinstanceAdminv1" {
  source  = "terraform-google-modules/iam/google//modules/folders_iam"
  version = "~> 7.4"

  folders = [
    module.cs-envs["kernel"].ids["development"],
  ]
  bindings = {
    "roles/compute.instanceAdmin.v1" = [
      "group:gcp-developers@hipeerlab.com",
    ]
  }
}

module "cs-folders-iam-2-containeradmin" {
  source  = "terraform-google-modules/iam/google//modules/folders_iam"
  version = "~> 7.4"

  folders = [
    module.cs-envs["kernel"].ids["development"],
  ]
  bindings = {
    "roles/container.admin" = [
      "group:gcp-developers@hipeerlab.com",
    ]
  }
}

module "cs-folders-iam-3-computeinstanceAdminv1" {
  source  = "terraform-google-modules/iam/google//modules/folders_iam"
  version = "~> 7.4"

  folders = [
    module.cs-envs["organizations"].ids["development"],
  ]
  bindings = {
    "roles/compute.instanceAdmin.v1" = [
      "group:gcp-developers@hipeerlab.com",
    ]
  }
}

module "cs-folders-iam-3-containeradmin" {
  source  = "terraform-google-modules/iam/google//modules/folders_iam"
  version = "~> 7.4"

  folders = [
    module.cs-envs["organizations"].ids["development"],
  ]
  bindings = {
    "roles/container.admin" = [
      "group:gcp-developers@hipeerlab.com",
    ]
  }
}

module "cs-projects-iam-4-loggingviewer" {
  source  = "terraform-google-modules/iam/google//modules/projects_iam"
  version = "~> 7.4"

  projects = [
    module.cs-logging-ha468-pm749.project_id,
  ]
  bindings = {
    "roles/logging.viewer" = [
      "group:gcp-logging-viewers@hipeerlab.com",
    ]
  }
}

module "cs-projects-iam-4-loggingprivateLogViewer" {
  source  = "terraform-google-modules/iam/google//modules/projects_iam"
  version = "~> 7.4"

  projects = [
    module.cs-logging-ha468-pm749.project_id,
  ]
  bindings = {
    "roles/logging.privateLogViewer" = [
      "group:gcp-logging-viewers@hipeerlab.com",
    ]
  }
}

module "cs-projects-iam-4-bigquerydataViewer" {
  source  = "terraform-google-modules/iam/google//modules/projects_iam"
  version = "~> 7.4"

  projects = [
    module.cs-logging-ha468-pm749.project_id,
  ]
  bindings = {
    "roles/bigquery.dataViewer" = [
      "group:gcp-logging-viewers@hipeerlab.com",
    ]
  }
}

module "cs-projects-iam-5-bigquerydataViewer" {
  source  = "terraform-google-modules/iam/google//modules/projects_iam"
  version = "~> 7.4"

  projects = [
    module.cs-logging-ha468-pm749.project_id,
  ]
  bindings = {
    "roles/bigquery.dataViewer" = [
      "group:gcp-security-admins@hipeerlab.com",
    ]
  }
}

module "cs-service-projects-iam-6-computeinstanceAdminv1" {
  source  = "terraform-google-modules/iam/google//modules/projects_iam"
  version = "~> 7.4"

  projects = [
    module.cs-svc-kernel-prod-svc-czzc.project_id,
  ]
  bindings = {
    "roles/compute.instanceAdmin.v1" = [
      "group:${module.cs-gg-kernel-prod-service.id}",
    ]
  }
}

module "cs-service-projects-iam-7-computeinstanceAdminv1" {
  source  = "terraform-google-modules/iam/google//modules/projects_iam"
  version = "~> 7.4"

  projects = [
    module.cs-svc-kernel-nonprod-svc-czzc.project_id,
  ]
  bindings = {
    "roles/compute.instanceAdmin.v1" = [
      "group:${module.cs-gg-kernel-nonprod-service.id}",
    ]
  }
}

module "cs-service-projects-iam-8-computeinstanceAdminv1" {
  source  = "terraform-google-modules/iam/google//modules/projects_iam"
  version = "~> 7.4"

  projects = [
    module.cs-svc-organizations-prod-svc-czzc.project_id,
  ]
  bindings = {
    "roles/compute.instanceAdmin.v1" = [
      "group:${module.cs-gg-organizations-prod-service.id}",
    ]
  }
}

module "cs-service-projects-iam-9-computeinstanceAdminv1" {
  source  = "terraform-google-modules/iam/google//modules/projects_iam"
  version = "~> 7.4"

  projects = [
    module.cs-svc-organizations-nonprod-svc-czzc.project_id,
  ]
  bindings = {
    "roles/compute.instanceAdmin.v1" = [
      "group:${module.cs-gg-organizations-nonprod-service.id}",
    ]
  }
}
