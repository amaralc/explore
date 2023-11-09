variable "log_map" {
  type = map(string)
}

variable "enabled" {
  description = "Weather logging is enabled or not"
  type        = bool
  default     = false
}
