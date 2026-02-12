# Long-Term Insights

Key insights from this repository.

1. Team-based directories mirror Conway's Law and domain ownership.
2. Hexagonal architecture separates core logic from framework adapters.
3. TDD (RED-GREEN-REFACTOR) drives the entire development workflow.
4. Toyota Kata improvement cycles drive deliberate experimentation.
5. KAIZEN commit tags signal continuous improvement work.
6. The Repository pattern abstracts persistence behind interfaces.
7. Dynamic modules select providers at runtime via environment variables.
8. In-memory repositories make unit tests fast and deterministic.
9. Strategy pattern governs database, event, and IAM provider switching.
10. REST APIs and event consumers scale independently as separate projects.
11. DORA metrics are tracked via Atlassian Compass deployment events.
12. Small, single-concern commits reduce batch size and risk.
13. A/B testing eliminates opinion-based infrastructure decisions.
14. Core domain libraries have zero framework runtime dependencies.
15. Terraform modules are composable, testable, and reusable.
16. Crossplane provisions cloud resources as Kubernetes-native objects.
17. NestJS Testing Module enables isolated dependency injection in tests.
18. E2E tests verify the full Kafka-to-HTTP pipeline end to end.
19. GKE Autopilot eliminates node management overhead entirely.
20. Private clusters hide the API server from the public internet.
21. Secrets are generated at runtime, never hardcoded in manifests.
22. Kafka provides durable, ordered event streaming between services.
23. API stability levels communicate change risk to consumers.
24. Developer onboarding time reduction is treated as a Kaizen goal.
25. NX Release handles versioning, changelogs, and releases via conventional commits.
26. NX orchestrates tasks, caches results, and tracks dependencies.
27. NX Cloud remote caching reduces CI execution time by 95%.
28. Shared utilities library prevents cross-team code duplication.
29. Module boundary rules prevent circular dependency formation.
30. Init containers separate database seeding from application runtime.
31. Liveness and readiness probes ensure healthy traffic routing.
32. Service account token automounting is disabled by default.
33. Kubernetes Secrets store credentials, ConfigMaps store config.
34. Default PostgreSQL superuser name is replaced with random values.
35. Event handlers validate payloads before any processing occurs.
36. Event topic names are centralized as domain constants.
37. Prisma is the primary ORM with migration-managed schemas.
38. Schema changes require explicit client regeneration before builds.
39. URI versioning enables safe, parallel API evolution.
40. OpenAPI docs are auto-generated from NestJS decorators.
41. Faker.js generates realistic test data instead of static strings.
42. Error paths are tested with the same rigor as happy paths.
43. Blog posts document lessons learned from each improvement cycle.
44. Cognitive complexity reduction is an explicit refactoring target.
45. Technical debt is managed through explicit archiving, not neglect.
46. Parameterized modules serve multiple consumers from one source.
47. IaC targets integrate into the NX build dependency graph.
48. Environment-specific naming prevents resource collisions.
49. Resource requests and limits enforce predictable pod scheduling.
50. HorizontalPodAutoscaler provides elastic CPU-based scaling.
51. ClusterIP services restrict traffic to cluster-internal paths.
52. Managed certificates automate TLS provisioning and renewal.
53. VPC flow logging captures network telemetry for security analysis.
54. Cloud NAT handles egress for private nodes without public IPs.
55. API key guards protect service-to-service REST endpoints.
56. NoSQL injection vulnerabilities are actively found and eliminated.
57. Error responses are sanitized to prevent information exposure.
58. Dockerfile vulnerabilities are tracked and remediated via Snyk.
59. Regular `pnpm audit` and `pnpm audit fix` catch npm vuln drift early.
60. NX Cloud tokens use placeholder replacement to prevent leakage.
61. Fork PR tokens are read-only; CI write permissions only affect collaborators.
62. Avoid write permissions on pull_request_target to prevent supply chain attacks.
63. Event error logging captures topic, partition, and message context.
64. Multiple Kafka transporter strategies are supported via config.
65. Consumer groups enable horizontal scaling of event processing.
66. Multi-database support validates the adapter pattern boundary.
67. Database-per-service isolation prevents cross-domain data coupling.
68. Both Neon and Cloud SQL are supported as PostgreSQL providers.
69. Repository methods map ORM entities to domain entities cleanly.
70. The test pyramid targets ~80% unit, ~15% integration, ~5% E2E tests.
71. Error messages are centralized in constant objects per domain.
72. Affected-only CI runs skip unchanged projects entirely.
73. PNPM workspaces auto-discover packages via glob patterns.
74. TypeScript path aliases provide clean cross-project imports.
75. Multiple build tools (Webpack, Vite, esbuild) serve their targets.
76. Release tags trigger deployment pipelines automatically.
77. Terraform auto-approve runs only in CI, never locally.
78. Flaky tests erode trust; even 1% flakiness causes teams to ignore results.
79. Tests should verify resulting state, not implementation interactions.
80. Docker Compose provides a production-like local data layer.
81. Tests target public APIs so internal refactors never break them.
82. Workload Identity Federation replaces service account keys for keyless CI/CD authentication.
83. Real implementations are preferred over test doubles for higher fidelity.
84. DAMP (Descriptive And Meaningful Phrases) trumps DRY in test code.
85. Configuration changes are the leading cause of major outages at scale.
86. Fakes must pass contract tests run against both fake and real implementations.
87. Pre-commit hooks exist but are opt-in for developer flexibility.
88. GitHub issue templates map 1:1 to Toyota Kata artifacts: challenge, target, obstacle, experiment.
89. Structured JSON logging enables machine parsing without regex.
90. Middleware latency tracking quantifies per-request performance.
91. Shared UI component library ensures visual consistency.
92. Archive directory marks deprecated code as explicitly historical.
93. Test configuration is centralized via NX Jest presets.
94. Named inputs exclude test files from build cache invalidation.
95. Schema validation tests enforce backward compatibility on changes.
96. Chaos engineering reveals resilience gaps through continuous fault injection.
97. Terraform state is managed remotely, never locally.
98. Provider versions are pinned in each module's versions.tf file.
99. Implicit NX dependencies enforce IaC provisioning order.
100. GitHub environment protection rules gate deployments without splitting workflows.
