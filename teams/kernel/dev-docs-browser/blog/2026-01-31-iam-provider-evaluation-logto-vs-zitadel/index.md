---
title: 'IAM Provider Evaluation: Logto vs Zitadel on Kubernetes'
authors: [amaralc]
tags: [iam, kubernetes, logto, zitadel, infrastructure, security]
---

We evaluated two self-hosted identity and access management (IAM) providers — **Logto** and **Zitadel** — for deployment on Kubernetes. This post documents the implementation plan, findings from local testing, lessons learned, and the decision to move forward with Logto.

<!-- truncate -->

## Context

The project needed a self-hosted IAM solution to complement or replace Firebase Auth. Key criteria:

- **OIDC compliance** — Standard OpenID Connect endpoints (discovery, authorization, token, userinfo, JWKS)
- **Admin console** — Web-based UI for managing tenants, applications, and users
- **Self-hosting simplicity** — Straightforward deployment on Kubernetes with minimal configuration
- **K8s-native patterns** — Works well with standard Kubernetes resources (Deployments, Services, ConfigMaps, Secrets)

Both Logto and Zitadel met the OIDC compliance and admin console criteria on paper, so we built an A/B comparison to evaluate them side by side.

## Implementation Plan

We followed an 8-phase TDD approach (RED → GREEN → REFACTOR for each phase):

### Phase 1: GKE Cluster Module

A reusable Terraform module (`iac-modules/gcp-gke-cluster`) that provisions a GKE Autopilot cluster with a dedicated subnet. Validated with Terratest.

### Phase 2: Crossplane Bootstrap Module

A Terraform module (`iac-modules/gcp-gke-crossplane`) that installs Crossplane via Helm, configures the GCP SQL provider, and sets up Workload Identity for cloud resource provisioning. Validated with Terratest.

### Phase 3: Crossplane PostgreSQL Module

A parameterized module (`iac-modules/crossplane-postgresql`) that creates a Crossplane XRD, Composition, and Claim for CloudSQL PostgreSQL instances. The same module is called with different parameters for each IAM provider:

- Logto: PostgreSQL 17, namespace `logto`
- Zitadel: PostgreSQL 16, namespace `zitadel`

### Phase 4: Kubernetes Manifests

Seven manifests per provider (namespace, configmap, secret, deployment, service, ingress, HPA):

- **Logto** — Uses `svhd/logto:latest` with an init container that runs `npm run cli db seed -- --swe` for database initialization. Exposes ports 3001 (app) and 3002 (admin console). Configuration: `DB_URL`, `ENDPOINT`, `ADMIN_ENDPOINT`, `TRUST_PROXY_HEADER`.

- **Zitadel** — Uses `ghcr.io/zitadel/zitadel:latest` with a `start-from-init` command that combines initialization and startup. Exposes port 8080 for both app and admin. Configuration: `ZITADEL_DATABASE_POSTGRES_HOST`, `ZITADEL_DATABASE_POSTGRES_USER_USERNAME`, `ZITADEL_DATABASE_POSTGRES_USER_PASSWORD`, `ZITADEL_DATABASE_POSTGRES_ADMIN_USERNAME`, `ZITADEL_DATABASE_POSTGRES_ADMIN_PASSWORD`, `ZITADEL_MASTERKEY`, `ZITADEL_EXTERNALSECURE`, `ZITADEL_DATABASE_POSTGRES_PORT`, `ZITADEL_DATABASE_POSTGRES_DATABASE`, `ZITADEL_DATABASE_POSTGRES_USER_SSL_MODE`, `ZITADEL_DATABASE_POSTGRES_ADMIN_SSL_MODE`.

### Phase 5: Terraform Orchestrator

The orchestrator (`security-iam-svc/iac/main.tf`) chains all layers:

```
GKE Cluster → Crossplane → PostgreSQL databases → K8s resources
```

### Phase 6: Local Development

A minikube-based setup (`local/setup-local.sh`) that deploys local PostgreSQL StatefulSets and both IAM services for testing without cloud resources.

### Phase 7: A/B Comparison Test

An automated script (`tests/ab-comparison-test.sh`) that tests health checks, OIDC discovery, response latency, admin console accessibility, and standard OIDC endpoint presence for both providers.

### Phase 8: Integration

Updated the shell-iac environment module, Makefile targets, and NX project configuration to wire everything together.

## Findings

### Logto: Smooth Setup

Logto deployed without issues on minikube:

1. The PostgreSQL 17 StatefulSet came up and passed readiness probes
2. The init container successfully seeded the database
3. The main container started and passed both liveness and readiness probes
4. The service was accessible on the expected ports

The configuration surface was minimal — a single `DB_URL` connection string plus endpoint URLs.

### Zitadel: CrashLoopBackOff

Zitadel failed to start on minikube:

1. **First failure**: The deployment used `start-from-init` as a standalone command, but it is a subcommand of the `zitadel` binary. The container crashed with `executable file not found in $PATH`.

2. **After fix**: Correcting the command to `zitadel start-from-init` still resulted in CrashLoopBackOff, indicating additional configuration issues beyond the command syntax.

3. **Configuration complexity**: Zitadel requires 11+ environment variables covering database host, user credentials, admin credentials, master key, SSL modes, and external secure flags — compared to Logto's 4.

## Lessons Learned

### Container command conventions vary significantly

Logto uses a standard Node.js entrypoint where the default `CMD` works out of the box. Zitadel uses a Go binary where `start-from-init` is a subcommand that must be passed as args to the `zitadel` entrypoint. This distinction between `ENTRYPOINT` and `CMD` in container images is a common source of deployment issues.

### Init container pattern provides cleaner separation

Logto separates database seeding (init container) from the application runtime (main container). Zitadel combines both in a single `start-from-init` command. The separated approach is easier to debug — when the init container fails, the pod status clearly shows `Init:Error`, and logs are isolated.

### Configuration surface area matters

Logto's minimal configuration (`DB_URL` + endpoints) reduces the chance of misconfiguration. Zitadel's granular configuration (separate user/admin credentials, SSL modes per role, master key, external secure flag) provides more control but increases the setup burden and error surface.

### PostgreSQL version requirements

Logto works with PostgreSQL 17 (latest). Zitadel requires PostgreSQL 16, which is one version behind. This is a minor point but reflects Zitadel's more conservative compatibility approach.

## Decision

**Move forward with Logto.**

The evaluation was designed to surface practical differences in deployment complexity, and it did exactly that. Logto's simpler setup, clear init container pattern, and minimal configuration make it the better fit for our infrastructure. Zitadel's additional configuration requirements and startup issues added friction without providing proportional benefits for our use case.

The Zitadel code has been removed from the repository. The shared infrastructure modules (GKE cluster, Crossplane bootstrap, Crossplane PostgreSQL) remain in place as they are provider-agnostic and continue to serve the Logto deployment.

## References

- [Logto Documentation](https://docs.logto.io/)
- [Logto Docker Deployment](https://docs.logto.io/docs/recipes/deployment/)
- [Zitadel Documentation](https://zitadel.com/docs)
- [Crossplane Documentation](https://docs.crossplane.io/)
