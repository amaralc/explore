---
title: 'Hardening the IAM Local Setup and GKE Cluster'
authors: [amaralc]
tags: [security, kubernetes, gke, iam, infrastructure, logto]
---

A series of security fixes applied to the IAM local development setup and GKE cluster configuration, replacing hardcoded credentials with generated secrets and restricting service account and network exposure.

<!-- truncate -->

## Hardcoded PostgreSQL Credentials

The local Logto setup previously used hardcoded PostgreSQL credentials — both the password (`p0stgr3s`) and the default superuser name (`postgres`) were baked into manifests and scripts. This is a common pattern in early-stage local dev environments, but it creates bad habits that can leak into production configs.

### Password (commit fc8c335)

The hardcoded password was replaced with a randomly generated value:

```bash
PG_PASSWORD="$(openssl rand -base64 24 | tr -d '/+=' | head -c 32)"
```

The generated password is injected into a Kubernetes secret (`postgresql-credentials`) during setup, and the PostgreSQL StatefulSet reads it via `secretKeyRef` instead of a plain `value` field.

### Username (commit 61c4bab)

The same pattern was applied to the username. Instead of relying on the default `postgres` superuser, the setup script now generates a random username:

```bash
PG_USERNAME="pguser_$(openssl rand -hex 4)"
```

This value is stored in the same `postgresql-credentials` secret and referenced by both the PostgreSQL container and the Logto `DB_URL`. The readiness probe was updated to resolve the username from the environment variable at runtime:

```yaml
command: ["sh", "-c", "pg_isready -U $POSTGRES_USER"]
```

## Disabling Service Account Token Automounting (commit 5e848e2)

SonarCloud flagged both the Logto Deployment and the local PostgreSQL StatefulSet for automounting service account tokens by default. Neither pod needs access to the Kubernetes API, so we disabled it:

```yaml
spec:
  automountServiceAccountToken: false
```

This reduces the attack surface — if a container is compromised, the attacker does not get a service account token that could be used to query the Kubernetes API.

## Private GKE Control Plane Endpoint (commit bf9da0b)

The GKE cluster module had `enable_private_endpoint = false`, meaning the Kubernetes API server was reachable via a public IP. While `master_authorized_networks_config` was available to restrict access by CIDR, we opted for the safer default: making the endpoint fully private.

```hcl
private_cluster_config {
  enable_private_nodes    = true
  enable_private_endpoint = true
  master_ipv4_cidr_block  = "172.16.0.0/28"
}
```

### Trade-off

With a private endpoint, `kubectl` is no longer accessible directly from a local machine over the internet. Access requires a path into the VPC — an IAP tunnel, a bastion host, a VPN, or Cloud Shell. We accepted this trade-off because the security benefit of eliminating public API server exposure outweighs the convenience of direct local access, especially as the infrastructure matures toward production readiness.

## Summary

| Fix | What changed | Why |
|-----|-------------|-----|
| Generated PG password | `openssl rand` instead of `p0stgr3s` | Eliminate hardcoded secrets |
| Generated PG username | `pguser_<random>` instead of `postgres` | Avoid default superuser name |
| Disable SA token mount | `automountServiceAccountToken: false` | Reduce pod attack surface |
| Private GKE endpoint | `enable_private_endpoint = true` | No public API server exposure |
