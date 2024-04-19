variable "log_map" {
  type = map(string)
}

variable "log_to_file" {
  description = "Log to file"
  type        = bool
  default     = false
}

variable "enabled" {
  description = "Weather logging is enabled or not"
  type        = bool
  default     = false
}
