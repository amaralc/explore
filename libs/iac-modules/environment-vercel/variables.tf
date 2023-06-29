variable "is_production_environment" {
  description = "Whether this is the production environment"
  type        = bool
}

variable "source_environment_project_id" {
  description = "The ID of the source Vercel project. If null, than we are creating a production environment, from ground up, otherwise than a preview environment is being created."
  type        = string
  default     = null
}

variable "project_name" {
  description = "The name of the project"
  type        = string

  validation {
    condition     = length(regexall("^[a-z]([-a-z0-9]{0,61}[a-z0-9])?$", var.project_name)) > 0
    error_message = "The name must be 1-63 characters long, start with a letter, end with a letter or digit, and only contain lowercase letters, digits or hyphens."
  }
}

variable "framework" {
  description = "The framework of the project"
  type        = string
  default     = null

  validation {
    condition     = var.framework == null || contains(["nextjs"], var.framework)
    error_message = "The framework must be null or one of ['nextjs']"
  }
}

variable "branch_name" {
  description = "The name of the branch"
  type        = string
}

variable "install_command" {
  description = "The install command"
  type        = string
  default     = null
}

variable "build_command" {
  description = "The build command"
  type        = string
  default     = null
}

variable "dev_command" {
  description = "The dev command"
  type        = string
  default     = null
}

variable "output_directory" {
  description = "The output directory"
  type        = string
  default     = null
}

variable "ignore_command" {
  description = "The ignore command"
  type        = string
  default     = null
}

variable "production_environment_variables" {
  description = "The production environment variables"
  type = set(object({
    key    = string
    value  = string
    target = set(string)
  }))
  default = null
}

variable "preview_environment_variables" {
  description = "The preview environment variables"
  type        = map(string)
  default     = null
}

variable "git_provider" {
  description = "The git provider"
  type        = string
  default     = "github"

  validation {
    condition     = contains(["github"], var.git_provider)
    error_message = "The git provider must be one of ['github']"
  }
}

variable "username_and_repository" {
  description = "The username and repository separated by a slash. Ex.: amaralc/peerlab"
  type        = string
  default     = "amaralc/peerlab"

  validation {
    condition     = length(regexall("^[a-z]([-a-z0-9]{0,61}[a-z0-9])?/[a-z]([-a-z0-9]{0,61}[a-z0-9])?$", var.username_and_repository)) > 0
    error_message = "The username and repository must be in the format username/repository"
  }
}






