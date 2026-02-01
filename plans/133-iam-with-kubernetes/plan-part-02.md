# Plan Part 02: Remove Zitadel, Keep Logto, Write Blog Post

## Context

After running the A/B comparison of Logto vs Zitadel on minikube:
- **Logto**: Deployed smoothly, init container seeded the DB, service accessible on ports 3001/3002
- **Zitadel**: CrashLoopBackOff due to incorrect command (`start-from-init` is a subcommand of the `zitadel` binary, not standalone). Even after fixing, continued crashing. More complex configuration surface.
- **Decision**: Move forward with Logto only. Remove Zitadel code and document findings.

---

## Phase 1: Delete Zitadel-only files

```
rm -rf teams/kernel/security-iam-svc/k8s/zitadel/          # 7 YAML manifests
rm     teams/kernel/security-iam-svc/local/local-postgresql-zitadel.yaml
rm     teams/kernel/security-iam-svc/tests/ab-comparison-test.sh
```

## Phase 2: Modify files to remove Zitadel references

### 2a. `teams/kernel/security-iam-svc/iac/main.tf`
- Update top-level comment (remove "A/B comparison" / Zitadel mentions)
- Remove `zitadel_endpoint` from `locals` block
- Remove `module "zitadel_database"` block
- Remove entire Layer 4b section (Zitadel namespace, configmap, deployment, service, ingress)
- Keep: shared infra (GKE, Crossplane), Logto database, all Logto K8s resources

### 2b. `teams/kernel/security-iam-svc/iac/outputs.tf`
- Remove `zitadel_endpoint` output block

### 2c. `teams/kernel/security-iam-svc/tests/iac_test.go`
- Remove `assert.True(t, outputKeys["zitadel_endpoint"], ...)` line
- Update comment

### 2d. `teams/kernel/security-iam-svc/local/setup-local.sh`
- Remove step 3 (Zitadel PostgreSQL) and step 5 (Zitadel deploy)
- Renumber from 6 steps to 4 steps
- Remove Zitadel access info from output section
- Update header (remove "A/B Test")

### 2e. `Makefile`
- Remove `iam-ab-test` target
- Update section comment

### 2f. `teams/kernel/security-iam-svc/project.json`
- Remove `ab-test` target from `targets`

### 2g. `teams/kernel/iac-modules/crossplane-postgresql/tests/crossplane_pg_test.go`
- Remove Zitadel test case `{"Zitadel", "zitadel", "zitadel", "POSTGRES_16"}`

### 2h. `teams/kernel/iac-modules/crossplane-postgresql/main.tf`
- Update comment to remove Zitadel reference (cosmetic)

## Phase 3: Validate

- Run `terraform validate` in `teams/kernel/security-iam-svc/iac/`
- Run `terraform validate` in `teams/kernel/iac-modules/crossplane-postgresql/`

## Phase 4: Create blog post

Create: `teams/kernel/dev-docs-browser/blog/2026-01-31-iam-provider-evaluation-logto-vs-zitadel/index.md`

Content covers:
1. **Context** - Need for self-hosted IAM, evaluation criteria
2. **Implementation plan** - 8-phase TDD approach (GKE, Crossplane, PostgreSQL, K8s manifests, orchestrator, local dev, A/B test, integration)
3. **Findings** - Logto deployed smoothly; Zitadel hit CrashLoopBackOff (wrong command, complex config)
4. **Lessons learned** - Container command conventions, config surface area, init patterns
5. **Decision** - Move forward with Logto

## Out of scope (pre-existing on trunk)
- Frontend Zitadel components in `management-shell-browser/`
- `docker-compose-zitadel.yaml`, `setup-zitadel.sh`
- `teardown-local.sh` (no Zitadel-specific content)
