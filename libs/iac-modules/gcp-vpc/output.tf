output "private_network" {
  value = google_compute_network.private_network
}

output "private_vpc_connection" {
  value = google_service_networking_connection.private_vpc_connection
}
