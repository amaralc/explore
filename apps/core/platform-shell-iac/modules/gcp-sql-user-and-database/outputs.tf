output "user" {
  value     = google_sql_user.user
  sensitive = true
}

output "database" {
  value     = google_sql_database.database
  sensitive = true
}
