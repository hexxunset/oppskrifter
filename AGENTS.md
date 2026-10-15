# AI Context (personal)

Shared AI conventions, rules, skills, and agents for personal projects. Tool-agnostic — read by Claude, Cursor, Copilot, Gemini, etc.

**Important:** If `PROJECT.md` exists in a repo, read it for project-specific instructions and overrides.

> **Context:** These are personal projects that run locally. There is no CI/CD, no cloud deployment, and no work tooling (Jira, Datadog, etc.). Keep tooling and process lightweight — verification happens locally before committing.

## Workflow

- Always analyse the codebase and plan before executing changes
- Keep documentation synchronized with code changes
- **Never commit code that doesn't compile.** Verify locally before committing, using the project's stack:
  - Java / Spring: `mvn clean compile -DskipTests` (compile), then `mvn test` (tests)
  - Svelte / SvelteKit: `pnpm build` (compile), then `pnpm lint` + `pnpm check` + `pnpm test` (quality)

## Coding Rules

Read the relevant `.ai-rules/` files before generating code:

- Shared (all projects): `.ai-rules/shared/{git-conventions,api-integration}.md`
- Backend (Java / Spring): `.ai-rules/backend/{java-spring,security,database,testing,documentation}.md`
- Backend (Kotlin / Ktor): `.ai-rules/backend/{kotlin-ktor,exposed-sqlite,testing-kotlin,security,documentation}.md`
- Frontend: `.ai-rules/frontend/{angular,svelte,documentation}.md`

These rules describe conventions for the stacks they name. For any other stack, apply the general principles and follow the project's own conventions. A project only carries the rule files its stack needs (see its profile in the personal-ai-context repo).

## Skills (`.claude/skills/`)

Generic (all projects):

- `/commit` — create a Conventional Commit
- `/planning-docs` — create PRD / ADR / C4 / system-context docs
- `/sparring-plan` — build a plan via two sparring sub-agents (Proposer + Reviewer)
- `/ai-context-sync` — sync generic AI context from personal-ai-context into a project via its profile

Stack-specific (present only when the project's profile includes them):

- `/flyway-migration-create` — create a Flyway DB migration (Spring / Postgres)
- `/spring-crud-generator` — scaffold a Spring CRUD resource (entity → controller + tests)
- `/test-strategy-backend` — plan Spring test coverage (Mockito + Testcontainers)
- `/svelte-component-create` — scaffold a SvelteKit component (TypeScript + Vitest)
- `/read-local-logs` — read/analyse a local Spring Boot log file
