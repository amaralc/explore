# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PeerLab is a TypeScript/Node.js monorepo using NX workspace management, designed to connect university laboratories with societal needs. The codebase follows a team-based architecture with clear separation of concerns across different domains.

## Architecture

### Team-Based Structure
The project is organized into domain-based teams under `teams/`:

- **kernel/**: Core infrastructure, shared utilities, and platform services
  - `shared-ts-utils/`: Shared TypeScript utilities and types
  - `shared-ui-components/`: Reusable UI components
  - `api-gateway/`: Kong-based API gateway configuration
  - `iac-modules/`: Infrastructure as Code modules
  - `security-iam-svc/`: Identity and Access Management service

- **people/**: User management and research-related services
  - `researchers/peers/`: Core domain logic for researcher peers
  - `researchers-peers-svc/`: REST API and consumer services for peers
  - `skill-set/browser/`: Frontend application for skill management
  - `organizations-management/`: Organization management services

- **things/**: Asset and resource management
  - `assets-catalog/`: Catalog services for assets

- **web/**: Web-specific configurations (PostCSS, etc.)

### Technology Stack
- **Build System**: NX monorepo with PNPM workspaces
- **Frontend**: React with Vite, TypeScript, Emotion styling
- **Backend**: NestJS, Express, Prisma ORM
- **Database**: PostgreSQL with Prisma migrations
- **Testing**: Jest, Vitest, Cypress for E2E
- **Infrastructure**: Docker, Terraform, Google Cloud Platform
- **API Gateway**: Kong
- **Message Queuing**: Kafka

## Development Commands

### Environment Setup
```bash
# Copy environment configuration
pnpm env:setup

# Set up Docker containers for development
make setup
```

### Building and Testing
```bash
# Run all tests across projects
pnpm test:unit
# or
nx run-many --target=test --all=true

# Build specific service
pnpm build:researchers-peers-svc-rest-api

# Lint all projects
nx run-many --target=lint --all=true

# Run type checking (project-specific)
nx run <project-name>:build
```

### Running Services

#### Full Stack Development
```bash
# Start all services
pnpm start

# Start only backend services
pnpm start:back-end

# Start with Prisma setup
pnpm start:example:prisma
```

#### Individual Services
```bash
# Researchers peers REST API
make researchers-peers-svc-rest-api-serve

# Service consumer
make service-consumer-serve

# Skill set browser frontend
pnpm people-skill-set-browser:start
```

### Database Operations
```bash
# Generate Prisma client
pnpm prisma:generate:postgres

# Run migrations
pnpm prisma:migrate:dev

# Open Prisma Studio
pnpm prisma:studio

# Pull database schema
pnpm prisma:db:pull
```

### Infrastructure Management
```bash
# Terraform operations for staging
make terraform-init-staging
make terraform-plan-staging
make terraform-apply-staging

# Kong API Gateway (postgres mode)
make kong-postgres

# Kong API Gateway (dbless mode)
make kong-dbless
```

### Docker Operations
```bash
# Build specific service Docker image
make researchers-peers-svc-docker-build

# Run service in Docker
make researchers-peers-svc-rest-api-docker-run

# Clean up containers
make cleanup

# Remove volumes (destructive)
make prune
```

## Code Organization Patterns

### NX Project Structure
- Each service/library has a `project.json` defining build targets
- Libraries are in `teams/<domain>/<service-name>/` 
- Applications have `serve`, `build`, `test`, `lint` targets
- Docker targets are defined for deployable services

### Service Patterns
- **Core Domain Logic**: Pure business logic in `core/` subdirectories
- **Adapters**: Database, HTTP, and external service adapters in `adapters/`
- **REST APIs**: NestJS applications with OpenAPI documentation
- **Consumers**: Event-driven services for message processing

### Import Rules
- Enforce module boundaries with `@nx/enforce-module-boundaries` ESLint rule
- Libraries can depend on any tagged modules
- Use absolute imports from workspace root

## Testing Strategy

### Unit Tests
- Jest configuration in individual `jest.config.ts` files
- Run with `nx test <project-name>` or `pnpm test:unit`
- Coverage reports generated in `coverage/` directory

### E2E Tests
- Cypress for frontend applications
- Run with `nx e2e <project-name>-e2e`
- Backend E2E: `pnpm e2e:back-end`
- Frontend E2E: `pnpm e2e:front-end`

## Database Schema Management

The project uses Prisma with PostgreSQL located at:
`teams/people/researchers/peers/adapters/src/database/infra/prisma/postgresql.schema.prisma`

Always run `pnpm prisma:generate:postgres` after schema changes and before building services.

## Release Management

- Uses conventional commits with Lerna
- Automated changelog generation
- Release tags follow pattern: `peerlab@{version}`
- Commands: `pnpm release`, `pnpm prerelease`

## Environment Variables

Copy `.env.example` to `.env` and configure required variables. The project uses Firebase Auth, Google Cloud services, and requires various API keys and database URLs.

## Key Commands for Claude Code

When working on this codebase:

1. **Always run tests and linting**: `nx run-many --target=test --all=true && nx run-many --target=lint --all=true`
2. **Generate types after schema changes**: `pnpm generate-types`
3. **Build before deployment**: `pnpm build:researchers-peers-svc-rest-api` or `pnpm build:service-consumer`
4. **Check individual project**: `nx run <project-name>:build` for type checking