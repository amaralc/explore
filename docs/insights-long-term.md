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
27. Use nx.implicitDependencies in package.json to avoid pnpm errors for build-time IaC deps.
28. NX Cloud remote caching reduces CI execution time by 95%.
29. Shared utilities library prevents cross-team code duplication.
30. Module boundary rules prevent circular dependency formation.
31. Init containers separate database seeding from application runtime.
32. Liveness and readiness probes ensure healthy traffic routing.
33. Service account token automounting is disabled by default.
34. Kubernetes Secrets store credentials, ConfigMaps store config.
35. Default PostgreSQL superuser name is replaced with random values.
36. Event handlers validate payloads before any processing occurs.
37. Event topic names are centralized as domain constants.
38. Prisma is the primary ORM with migration-managed schemas.
39. Schema changes require explicit client regeneration before builds.
40. URI versioning enables safe, parallel API evolution.
41. OpenAPI docs are auto-generated from NestJS decorators.
42. Faker.js generates realistic test data instead of static strings.
43. Error paths are tested with the same rigor as happy paths.
44. Blog posts document lessons learned from each improvement cycle.
45. Cognitive complexity reduction is an explicit refactoring target.
46. Technical debt is managed through explicit archiving, not neglect.
47. Parameterized modules serve multiple consumers from one source.
48. IaC targets integrate into the NX build dependency graph.
49. Environment-specific naming prevents resource collisions.
50. Resource requests and limits enforce predictable pod scheduling.
51. HorizontalPodAutoscaler provides elastic CPU-based scaling.
52. ClusterIP services restrict traffic to cluster-internal paths.
53. Managed certificates automate TLS provisioning and renewal.
54. VPC flow logging captures network telemetry for security analysis.
55. Cloud NAT handles egress for private nodes without public IPs.
56. API key guards protect service-to-service REST endpoints.
57. NoSQL injection vulnerabilities are actively found and eliminated.
58. Error responses are sanitized to prevent information exposure.
59. Dockerfile vulnerabilities are tracked and remediated via Snyk.
60. Regular `pnpm audit` and `pnpm audit fix` catch npm vuln drift early.
61. NX Cloud tokens use placeholder replacement to prevent leakage.
62. Fork PR tokens are read-only; CI write permissions only affect collaborators.
63. Avoid write permissions on pull_request_target to prevent supply chain attacks.
64. Event error logging captures topic, partition, and message context.
65. Multiple Kafka transporter strategies are supported via config.
66. Consumer groups enable horizontal scaling of event processing.
67. Multi-database support validates the adapter pattern boundary.
68. Database-per-service isolation prevents cross-domain data coupling.
69. Both Neon and Cloud SQL are supported as PostgreSQL providers.
70. Repository methods map ORM entities to domain entities cleanly.
71. The test pyramid targets ~80% unit, ~15% integration, ~5% E2E tests.
72. Error messages are centralized in constant objects per domain.
73. Affected-only CI runs skip unchanged projects entirely.
74. PNPM workspaces auto-discover packages via glob patterns.
75. TypeScript path aliases provide clean cross-project imports.
76. Multiple build tools (Webpack, Vite, esbuild) serve their targets.
77. Release tags trigger deployment pipelines automatically.
78. Terraform auto-approve runs only in CI, never locally.
79. Flaky tests erode trust; even 1% flakiness causes teams to ignore results.
80. Tests should verify resulting state, not implementation interactions.
81. Docker Compose provides a production-like local data layer.
82. Tests target public APIs so internal refactors never break them.
83. Workload Identity Federation replaces service account keys for keyless CI/CD authentication.
84. Real implementations are preferred over test doubles for higher fidelity.
85. DAMP (Descriptive And Meaningful Phrases) trumps DRY in test code.
86. Configuration changes are the leading cause of major outages at scale.
87. Fakes must pass contract tests run against both fake and real implementations.
88. Pre-commit hooks exist but are opt-in for developer flexibility.
89. GitHub issue templates map 1:1 to Toyota Kata artifacts: challenge, target, obstacle, experiment.
90. Structured JSON logging enables machine parsing without regex.
91. Middleware latency tracking quantifies per-request performance.
92. Shared UI component library ensures visual consistency.
93. Archive directory marks deprecated code as explicitly historical.
94. Test configuration is centralized via NX Jest presets.
95. Named inputs exclude test files from build cache invalidation.
96. Schema validation tests enforce backward compatibility on changes.
97. Chaos engineering reveals resilience gaps through continuous fault injection.
98. Terraform state is managed remotely, never locally.
99. Provider versions are pinned in each module's versions.tf file.
100. Reusable workflows + NX dependencies enable independent team infrastructure bootstrap.
