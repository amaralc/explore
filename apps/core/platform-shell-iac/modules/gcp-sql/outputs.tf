output "google_sql_database_instance" {
  value     = google_sql_database_instance.postgresql-dbms
  sensitive = true
}
