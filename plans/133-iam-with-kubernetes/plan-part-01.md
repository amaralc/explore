# Issue #133: Deploy Logto & Zitadel IAM Services to K8s on GCP (A/B Test)

## Context

**Current state:** Cloud Run-based project, zero K8s or Crossplane. `security-iam-svc` has Firebase Terraform + docker-compose files for both Logto and Zitadel.

**Goal:** Deploy BOTH Logto and Zitadel to a shared GKE cluster, each with its own Crossplane-managed PostgreSQL database, to conduct an A/B comparison and decide which to keep.

## Architecture Overview

```
GKE Cluster (Autopilot)
  ├── crossplane-system/     (Crossplane operator + GCP provider)
  ├── logto/                 (Logto deployment + Crossplane-managed PostgreSQL)
  │   ├── Logto app          (ports 3001, 3002)
  │   └── PostgreSQL 17      (via Crossplane CloudSQL claim)
  └── zitadel/               (Zitadel deployment + Crossplane-managed PostgreSQL)
      ├── Zitadel app         (port 8080)
      └── PostgreSQL 16       (via Crossplane CloudSQL claim)
```

Both services share the same GKE cluster and Crossplane installation but are isolated in separate namespaces with independent databases.

---

## New Files to Create

### Layer 1: GKE Cluster Module

| File | Purpose |
|------|---------|
| `teams/kernel/iac-modules/gcp-gke-cluster/main.tf` | GKE Autopilot cluster + dedicated subnet |
| `teams/kernel/iac-modules/gcp-gke-cluster/variables.tf` | Inputs: project, location, network, environment |
| `teams/kernel/iac-modules/gcp-gke-cluster/outputs.tf` | Outputs: cluster name, endpoint, CA cert |
| `teams/kernel/iac-modules/gcp-gke-cluster/versions.tf` | google, google-beta providers |
| `teams/kernel/iac-modules/gcp-gke-cluster/project.json` | NX: `iac-modules-gcp-gke-cluster` |
| `teams/kernel/iac-modules/gcp-gke-cluster/tests/gke_cluster_test.go` | Terratest: validates cluster creation |

### Layer 2: Crossplane Bootstrap Module

| File | Purpose |
|------|---------|
| `teams/kernel/iac-modules/gcp-gke-crossplane/main.tf` | Helm install Crossplane + GCP SQL provider + Workload Identity SA |
| `teams/kernel/iac-modules/gcp-gke-crossplane/variables.tf` | Inputs: project, location, cluster endpoint/CA, crossplane version |
| `teams/kernel/iac-modules/gcp-gke-crossplane/outputs.tf` | Outputs: SA email, namespace, provider config name |
| `teams/kernel/iac-modules/gcp-gke-crossplane/versions.tf` | google, google-beta, helm, kubernetes providers |
| `teams/kernel/iac-modules/gcp-gke-crossplane/project.json` | NX: `iac-modules-gcp-gke-crossplane` |
| `teams/kernel/iac-modules/gcp-gke-crossplane/tests/crossplane_test.go` | Terratest: validates Crossplane readiness |

### Layer 3: Crossplane PostgreSQL Module (reusable for both IAMs)

| File | Purpose |
|------|---------|
| `teams/kernel/iac-modules/crossplane-postgresql/main.tf` | XRD + Composition + Claim for CloudSQL via Crossplane |
| `teams/kernel/iac-modules/crossplane-postgresql/variables.tf` | Inputs: project, location, cluster creds, provider config, db name, namespace, pg version |
| `teams/kernel/iac-modules/crossplane-postgresql/outputs.tf` | Outputs: connection secret name, database name |
| `teams/kernel/iac-modules/crossplane-postgresql/versions.tf` | kubernetes provider |
| `teams/kernel/iac-modules/crossplane-postgresql/project.json` | NX: `iac-modules-crossplane-postgresql` |
| `teams/kernel/iac-modules/crossplane-postgresql/compositions/postgresql-xrd.yaml` | CompositeResourceDefinition for PostgreSQLInstance |
| `teams/kernel/iac-modules/crossplane-postgresql/compositions/postgresql-composition.yaml` | Composition mapping to GCP CloudSQL |
| `teams/kernel/iac-modules/crossplane-postgresql/tests/crossplane_pg_test.go` | Terratest: validates DB provisioning |

### Layer 4a: Logto Kubernetes Manifests

| File | Purpose |
|------|---------|
| `teams/kernel/security-iam-svc/k8s/logto/namespace.yaml` | Namespace `logto` |
| `teams/kernel/security-iam-svc/k8s/logto/configmap.yaml` | TRUST_PROXY_HEADER, ENDPOINT, ADMIN_ENDPOINT |
| `teams/kernel/security-iam-svc/k8s/logto/secret.yaml` | Template for DB credentials (DB_URL) |
| `teams/kernel/security-iam-svc/k8s/logto/deployment.yaml` | Logto: `svhd/logto:latest`, init container for `npm run cli db seed -- --swe` |
| `teams/kernel/security-iam-svc/k8s/logto/service.yaml` | ClusterIP: ports 3001 (app), 3002 (admin) |
| `teams/kernel/security-iam-svc/k8s/logto/ingress.yaml` | Ingress for logto.{domain} and logto-admin.{domain} |
| `teams/kernel/security-iam-svc/k8s/logto/hpa.yaml` | HPA: 1-3 replicas, 70% CPU target |

### Layer 4b: Zitadel Kubernetes Manifests

| File | Purpose |
|------|---------|
| `teams/kernel/security-iam-svc/k8s/zitadel/namespace.yaml` | Namespace `zitadel` |
| `teams/kernel/security-iam-svc/k8s/zitadel/configmap.yaml` | ZITADEL_EXTERNALSECURE, masterkey, TLS mode |
| `teams/kernel/security-iam-svc/k8s/zitadel/secret.yaml` | Template for DB credentials (PG host/user/pass) |
| `teams/kernel/security-iam-svc/k8s/zitadel/deployment.yaml` | Zitadel: `ghcr.io/zitadel/zitadel:latest`, `start-from-init` command |
| `teams/kernel/security-iam-svc/k8s/zitadel/service.yaml` | ClusterIP: port 8080 |
| `teams/kernel/security-iam-svc/k8s/zitadel/ingress.yaml` | Ingress for zitadel.{domain} |
| `teams/kernel/security-iam-svc/k8s/zitadel/hpa.yaml` | HPA: 1-3 replicas, 70% CPU target |

### Layer 5: Local Development (minikube)

| File | Purpose |
|------|---------|
| `teams/kernel/security-iam-svc/local/local-postgresql-logto.yaml` | PostgreSQL 17-alpine StatefulSet for Logto (local) |
| `teams/kernel/security-iam-svc/local/local-postgresql-zitadel.yaml` | PostgreSQL 16-alpine StatefulSet for Zitadel (local) |
| `teams/kernel/security-iam-svc/local/setup-local.sh` | Full local setup: minikube + crossplane + both DBs + both IAMs |
| `teams/kernel/security-iam-svc/local/teardown-local.sh` | `minikube delete --profile peerlab-iam` |

### A/B Comparison

| File | Purpose |
|------|---------|
| `teams/kernel/security-iam-svc/tests/ab-comparison-test.sh` | Automated comparison: auth flow, latency, admin UX, OIDC compliance |

---

## Existing Files to Modify

| File | Change |
|------|--------|
| `teams/kernel/security-iam-svc/iac/main.tf` | **Rewrite**: GKE + Crossplane + 2x PostgreSQL claims + Logto K8s + Zitadel K8s |
| `teams/kernel/security-iam-svc/iac/variables.tf` | **Rewrite**: New vars (gcp_location, environment_name, gcp_network_id, domain) |
| `teams/kernel/security-iam-svc/iac/versions.tf` | **Rewrite**: Add kubernetes + helm providers |
| `teams/kernel/security-iam-svc/iac/outputs.tf` | **New**: Endpoints for both Logto and Zitadel |
| `teams/kernel/security-iam-svc/project.json` | Add implicitDependencies + local-setup/teardown targets |
| `teams/kernel/shell-iac/environment/v1.0.0/main.tf` | Update module call with new vars + vpc dependency |
| `teams/kernel/shell-iac/environment/v1.0.0/versions.tf` | Add kubernetes + helm providers |
| `teams/kernel/shell-iac/production/versions.tf` | Add kubernetes + helm providers |
| `Makefile` | Add `iam-local-setup`, `iam-local-teardown` targets |

---

## TDD Implementation Phases

### Phase 1: GKE Cluster (RED -> GREEN -> REFACTOR)

**RED** - `gcp-gke-cluster/tests/gke_cluster_test.go`:
- Test: `terraform validate` passes
- Test: Cluster name follows convention `{env}-gke`
- Test: Autopilot mode enabled
- Test: Subnet CIDR ranges valid
- Test: Outputs are non-empty

**GREEN** - Implement:
- `main.tf`: `google_container_cluster` (Autopilot) + `google_compute_subnetwork` (dedicated /20 subnet, secondary ranges for pods/services)
- `variables.tf`: environment_name, gcp_project_id, gcp_location, gcp_network_id, enable_deletion_protection, master_authorized_cidr_blocks
- `outputs.tf`: cluster_name, cluster_endpoint (sensitive), cluster_ca_certificate (sensitive), cluster_location, subnet_id

**REFACTOR**: `terraform plan` produces expected resource count.

### Phase 2: Crossplane Bootstrap (RED -> GREEN -> REFACTOR)

**RED** - `gcp-gke-crossplane/tests/crossplane_test.go`:
- Test: Helm release planned for `crossplane` chart
- Test: GCP service account created
- Test: Workload Identity binding configured
- Test: ProviderConfig resource planned

**GREEN** - Implement:
- `main.tf`: helm_release (crossplane), google_service_account, google_project_iam_member (cloudsql.admin), google_service_account_iam_member (workload identity), kubernetes_manifest (GCP SQL provider + ProviderConfig)

**REFACTOR**: Provider version pinned, depends_on chain correct.

### Phase 3: Crossplane PostgreSQL (RED -> GREEN -> REFACTOR)

**RED** - `crossplane-postgresql/tests/crossplane_pg_test.go`:
- Test: XRD YAML is valid Crossplane schema
- Test: Composition references correct GCP API versions
- Test: Claim writes connection secret to specified namespace
- Test: Module is parameterized (can be called twice with different db_name/namespace/pg_version)

**GREEN** - Implement:
- `compositions/postgresql-xrd.yaml`: XPostgreSQLInstance CRD (storageGB, version, region)
- `compositions/postgresql-composition.yaml`: Map to `sql.gcp.upbound.io/v1beta1 DatabaseInstance`
- `main.tf`: kubernetes_manifest for XRD, Composition, and Claim
- **Key**: `variables.tf` accepts `database_name`, `namespace`, `postgresql_version` so the same module serves both Logto (PG 17) and Zitadel (PG 16)

**REFACTOR**: YAML files pass `kubectl apply --dry-run=client`.

### Phase 4a: Logto K8s Manifests (RED -> GREEN -> REFACTOR)

**RED** - Shell acceptance test:
- Test: All manifests apply to minikube without errors
- Test: Deployment creates pod with `svhd/logto:latest`
- Test: Init container runs seed command (`npm run cli db seed -- --swe`)
- Test: Service exposes 3001, 3002
- Test: Probes configured (liveness: `/api/status`, readiness: `/api/status`)

**GREEN** - Implement `k8s/logto/` manifests:
- Deployment with init container (seed) + main container (app)
- ConfigMap: TRUST_PROXY_HEADER=1, ENDPOINT, ADMIN_ENDPOINT
- Secret: DB_URL from Crossplane connection secret
- Service: ClusterIP on 3001 (app) and 3002 (admin)
- Ingress: logto.{domain}, logto-admin.{domain}
- HPA: 1-3 replicas

**REFACTOR**: Resources meet GKE Autopilot minimums (250m CPU, 512Mi memory).

### Phase 4b: Zitadel K8s Manifests (RED -> GREEN -> REFACTOR)

**RED** - Shell acceptance test:
- Test: All manifests apply to minikube without errors
- Test: Deployment creates pod with `ghcr.io/zitadel/zitadel:latest`
- Test: Command is `start-from-init --masterkey ... --tlsMode disabled`
- Test: Service exposes 8080
- Test: Health check configured

**GREEN** - Implement `k8s/zitadel/` manifests:
- Deployment with `start-from-init` command and masterkey env
- ConfigMap: ZITADEL_DATABASE_POSTGRES_* env vars, ZITADEL_EXTERNALSECURE
- Secret: PostgreSQL credentials from Crossplane connection secret
- Service: ClusterIP on 8080
- Ingress: zitadel.{domain}
- HPA: 1-3 replicas

**REFACTOR**: Zitadel-specific env vars match docker-compose-zitadel.yaml.

### Phase 5: Orchestrator Rewrite (RED -> GREEN -> REFACTOR)

**RED** - `security-iam-svc/tests/iac_test.go`:
- Test: `terraform validate` passes
- Test: Module calls gke, crossplane, 2x postgresql, logto k8s, zitadel k8s
- Test: Outputs include endpoints for BOTH providers
- Test: depends_on chain: gke -> crossplane -> databases -> deployments

**GREEN** - Rewrite `security-iam-svc/iac/`:
- `main.tf`:
  ```
  module "gke_cluster" { ... }
  module "crossplane" { depends_on = [gke_cluster] }
  module "logto_database" { source = crossplane-postgresql, namespace = "logto", pg_version = "POSTGRES_17", depends_on = [crossplane] }
  module "zitadel_database" { source = crossplane-postgresql, namespace = "zitadel", pg_version = "POSTGRES_16", depends_on = [crossplane] }
  # Logto K8s resources (namespace, configmap, deployment, service, ingress, hpa)
  # Zitadel K8s resources (namespace, configmap, deployment, service, ingress, hpa)
  ```
- `outputs.tf`: logto_endpoint, logto_admin_endpoint, zitadel_endpoint, cluster_name

**REFACTOR**: `terraform plan` shows correct resource graph.

### Phase 6: Local Development with minikube (RED -> GREEN -> REFACTOR)

**RED** - `tests/local-e2e-test.sh`:
- Test: `setup-local.sh` creates minikube profile `peerlab-iam`
- Test: Both Logto and Zitadel pods reach Running state
- Test: Logto app responds (via `minikube service`)
- Test: Zitadel console responds (via `minikube service`)
- Test: `teardown-local.sh` removes the profile

**GREEN** - Implement:
- `local-postgresql-logto.yaml`: PG 17-alpine, user postgres, db logto (password via env var)
- `local-postgresql-zitadel.yaml`: PG 16-alpine, user postgres/postgres, db zitadel
- `setup-local.sh`: Create minikube profile, enable ingress addon, deploy both PGs, deploy both IAMs
- `teardown-local.sh`: `minikube delete --profile peerlab-iam`

**REFACTOR**: Both services accessible, matches docker-compose behavior.

### Phase 7: A/B Comparison Test (RED -> GREEN -> REFACTOR)

**RED** - `tests/ab-comparison-test.sh`:
- Test: Both IAMs respond to health checks
- Test: OIDC discovery endpoint returns valid config (both)
- Test: User signup flow completes (both)
- Test: Token issuance works (both)
- Test: Response times logged for comparison
- Test: Admin console accessible (both)

**GREEN** - Implement comparison script that:
1. Verifies OIDC `.well-known/openid-configuration` for both
2. Creates a test user on each platform
3. Performs login flow and measures latency
4. Checks token format and claims
5. Outputs a comparison report (table format)

**REFACTOR**: Report covers all evaluation criteria.

### Phase 8: Integration (RED -> GREEN -> REFACTOR)

**RED** - Verify `terraform validate` passes on shell-iac after modifications.

**GREEN** - Modify:
- `environment/v1.0.0/main.tf`: Update module call with new vars (gcp_location, environment_name, gcp_network_id)
- `environment/v1.0.0/versions.tf`: Add kubernetes + helm providers
- `production/versions.tf`: Same provider additions
- `Makefile`: Add `iam-local-setup`, `iam-local-teardown` targets
- `project.json`: Add NX dependencies and targets

**REFACTOR**: NX dependency graph correct (`nx graph`), all terraform validates pass.

---

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| GKE mode | Autopilot | Minimal ops overhead, aligns with managed-service preference |
| DB provisioning | Crossplane (per issue) | Declarative K8s-native; same module serves both IAMs |
| PostgreSQL module | Parameterized (version, namespace, db name) | Single module, called twice: PG 17 for Logto, PG 16 for Zitadel |
| K8s manifests | Separate subdirs per IAM (`k8s/logto/`, `k8s/zitadel/`) | Clean isolation, easy to delete the loser after A/B test |
| Local K8s | minikube | Full-featured, built-in addons (ingress, dashboard), `minikube service` for easy access |
| Local dev DB | Raw PostgreSQL StatefulSet per IAM | Crossplane-managed local DB is overkill |
| A/B testing | Automated script + manual evaluation | Script covers OIDC compliance and latency; manual evaluation covers UX, docs, ecosystem |
| Test framework | Terratest (Go) + shell scripts | IaC testing best practices; shell for K8s acceptance and A/B tests |

## A/B Evaluation Criteria

| Criterion | How to Measure |
|-----------|---------------|
| OIDC compliance | Automated: validate discovery endpoint, token format, standard claims |
| Auth flow latency | Automated: time signup, login, token refresh for both |
| Admin UX | Manual: compare admin consoles side by side |
| SDK ecosystem | Manual: compare React SDK quality (@zitadel/react vs @logto/react) |
| Self-hosting complexity | Manual: compare resource usage, config surface area |
| Documentation quality | Manual: review official docs for both |
| Community & maintenance | Manual: GitHub activity, release cadence |

## Verification Checklist

- [ ] All Terratest tests pass for each module
- [ ] `terraform validate` passes on all modules and shell-iac
- [ ] `terraform plan` shows expected resource graph (GKE + Crossplane + 2x DB + 2x IAM)
- [ ] K8s manifests pass `kubectl apply --dry-run=client` for both Logto and Zitadel
- [ ] Local setup produces running Logto on minikube (ports 3001/3002)
- [ ] Local setup produces running Zitadel on minikube (port 8080)
- [ ] A/B comparison script runs and outputs report
- [ ] `teardown-local.sh` cleanly removes all resources
- [ ] NX dependency graph reflects new modules
