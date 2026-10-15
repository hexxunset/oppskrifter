---
name: planning-docs
description: Create or update planning documents (PRD, ADR, C4 diagrams, system context) for future functionality. Use when the user asks to write a PRD/ADR, document architecture, or draw C4/system-context diagrams.
---

# Planning Documentation Skill

## When to Use This Skill

Use this skill when you are asked to **plan future functionality** — i.e., creating or updating persistent planning documents (PRDs, C4 architecture, ADRs, system context) that will live in the repository.

**Use this skill when:**

- The user asks you to plan, design, or document a new feature, service, or system
- The user asks you to create a PRD, ADR, C4 diagram, or system context document
- The user asks you to update existing planning documents based on new requirements
- The task involves producing documentation artifacts in `docs/` for future work

**Do NOT use this skill when:**

- You are planning how to implement a concrete, immediate task (use Plan Mode instead)
- You are doing code-level design during an implementation session
- You are writing inline code comments or API docs as part of a code change
- You are reviewing existing documentation

The distinction: **planning documents** describe _what_ should be built and _why_. **Implementation planning** is about _how_ to build something you are about to code right now.

## Directory Structure

All planning documents live under `docs/` in the repository:

```
docs/
├── prd/
│   ├── prd.json              # Machine-readable product requirements
│   └── prd.schema.json       # JSON Schema for PRD validation
└── architecture/
    ├── system_context.md      # Domain context, current/target state, glossary
    ├── C4_overview.md         # C4 model (Level 1-4 diagrams)
    ├── [component]_architecture.md  # Detailed component architecture
    └── adrs/
        ├── 001-template.md
        ├── 002-[decision-name].md
        └── ...
```

Create this structure if it does not already exist. Do not create documents that are not needed — only produce artifacts that are relevant to the scope of the planning task.

## Planning Process

When asked to plan future functionality, follow this process:

### 1. Understand the domain

Before writing any documents, gather context:

- Read existing documentation in `docs/` if it exists
- Read `PROJECT.md` if present for repo-specific context
- Understand the current architecture and codebase
- Ask clarifying questions about business goals, constraints, and stakeholders
- Identify what already exists vs what is new

### 2. Start with System Context

If this is a new service or a significant change to an existing system, create or update `docs/architecture/system_context.md` first. This grounds all other documents in shared understanding.

### 3. Create the PRD

Define _what_ should be built and _why_. The PRD is the source of truth for requirements.

### 4. Document architecture decisions

For each significant technical decision, create an ADR. Decisions include: technology choices, integration patterns, data models, security approaches.

### 5. Create C4 diagrams

Visualize the architecture at appropriate levels. Not all levels are needed — use judgment.

### 6. Detail component architecture

For complex components, create a dedicated architecture document that goes deeper than C4.

## Document Formats

### PRD (`docs/prd/prd.json`)

The PRD is a structured JSON document. Use the schema at `docs/prd/prd.schema.json` for validation if it exists. If the schema does not exist, create it alongside the PRD.

Required sections:

```json
{
	"metadata": {
		"productName": "Name of the product/feature",
		"version": "0.1.0",
		"lastUpdated": "ISO 8601 timestamp",
		"author": "Team or person name",
		"trackerIssue": "issue id / URL (parent, if known)"
	},
	"introduction": {
		"vision": "What this product/feature is and what it achieves long-term",
		"problemStatement": "The specific problem being solved and why it matters now",
		"scope": {
			"inScope": ["List of features/capabilities included in this release"],
			"outOfScope": ["List of features explicitly excluded — prevents scope creep"]
		}
	},
	"userPersonas": [
		{
			"name": "Persona name",
			"demographics": "Role/system description",
			"goals": ["What this persona wants to achieve"],
			"painPoints": ["Current problems this persona faces"]
		}
	],
	"functionalRequirements": [
		{
			"id": "FEAT-001",
			"trackerIssue": "issue id / URL (if known)",
			"userStory": "As a [persona], I want to [action], so that [benefit]",
			"acceptanceCriteria": [
				"Given [context], when [action], then [result]",
				"Each criterion must be concrete and testable"
			],
			"priority": "Must-Have | Should-Have | Could-Have | Won't-Have"
		}
	],
	"nonFunctionalRequirements": {
		"performance": "Specific, measurable performance targets",
		"security": "Security standards and compliance requirements",
		"scalability": "Scalability targets with concrete numbers",
		"usability": "Usability goals"
	},
	"successMetrics": [
		{
			"metricName": "Name of the metric",
			"kpi": "What is being measured",
			"target": "Target value with unit"
		}
	]
}
```

Guidelines:

- Every functional requirement MUST have acceptance criteria
- Use MoSCoW prioritization (Must-Have, Should-Have, Could-Have, Won't-Have)
- Scope: be explicit about what is out of scope — this prevents ambiguity
- Link to tracker issues when known
- Write user stories from the perspective of the actual consumer (user, system, process)
- Success metrics should be measurable and have concrete targets
- If the user has not provided enough detail for a section, ask — do not fill in placeholder text

### System Context (`docs/architecture/system_context.md`)

This document explains the domain, the current state, the target state, and why the change is happening. It is the most important document for onboarding new team members or AI assistants to the project.

Required sections:

```markdown
# System Context — [System Name]

## Background

[Explain the domain. What business process does this system support?
Define key concepts that someone unfamiliar with the domain would need.]

## Problem Statement

[Why is the current state insufficient? What specific problems need solving?
Be concrete — not "the system is old" but "the current system causes X
which results in Y impact on Z stakeholders."]

## Current State Architecture

[How does the system work today? Include a diagram if multiple systems
are involved. Focus on the parts that are changing or being replaced.]

## Target State Architecture

[How should the system work after this initiative? Include a diagram.
Explain what changes and what stays the same.]

## Migration Strategy

[How do we get from current to target? Phased approach? Feature flags?
Gradual rollout? What is the rollback plan?]

## Key Components

[List the systems involved with their role and status (NEW/EXISTING/DEPRECATED).]

## Glossary

[Define domain-specific terms, abbreviations, and acronyms.
This section is critical — domain knowledge is often the biggest barrier.]
```

### C4 Architecture (`docs/architecture/C4_overview.md`)

Use the C4 model to visualize architecture at multiple levels. Use ASCII diagrams — they are version-controllable, diff-friendly, and do not require external tools.

Levels:

- **Level 1 (System Context)**: How does this system fit into the broader landscape? What external systems does it interact with?
- **Level 2 (Container)**: What are the major deployable units? (APIs, databases, message queues, batch jobs)
- **Level 3 (Component)**: What are the key components inside each container? (Controllers, services, clients, engines)
- **Level 4 (Code)**: Key classes and their relationships. Only include this level for complex core components.

Guidelines:

- Not all levels are always needed. Level 1 and 2 are almost always useful. Level 3 is useful for complex services. Level 4 is rarely needed.
- Every box in a diagram should have a brief description explaining its responsibility
- Show the direction and nature of interactions (sync REST, async Pub/Sub, database queries)
- Keep diagrams simple — if a diagram is hard to read, split it

### ADRs (`docs/architecture/adrs/NNN-[name].md`)

Create an ADR for each significant architectural decision. A decision is significant if:

- It constrains future development choices
- It involves trade-offs that the team should understand
- It would be surprising to someone joining the project
- Reversing it would be costly

Format:

```markdown
# ADR-NNN: [Title — short, descriptive]

## Status

[PROPOSED | ACCEPTED | REJECTED | DEPRECATED | SUPERSEDED]

## Context

[What is the problem or need? What forces are at play?
Write 2-3 sentences that make the decision understandable without
reading any other document.]

## Decision

[What was decided and how it will be implemented. Be specific enough
that someone can verify whether the decision was followed.]

## Consequences

### Positive

- [Benefits of this approach]

### Negative

- [Drawbacks, risks, or costs]

### Neutral

- [Trade-offs that are neither clearly positive nor negative]

## Alternatives Considered

### [Alternative 1 name]

[Description, pros, cons, and why it was rejected]

### [Alternative 2 name]

[Description, pros, cons, and why it was rejected]

## References

- [Links to relevant documentation, articles, or discussions]
```

Guidelines:

- Number ADRs sequentially (001, 002, ...)
- ADRs are immutable once accepted — if a decision changes, create a new ADR that supersedes the old one
- Always include at least one alternative — if there is no alternative, the decision is probably not worth documenting
- Consequences must include negative items — every decision has trade-offs
- If a template exists at `docs/architecture/adrs/001-template.md`, follow its structure

### Component Architecture (`docs/architecture/[component]_architecture.md`)

For complex components that need more detail than C4 Level 3 provides, create a dedicated architecture document.

Typical sections:

```markdown
# [Component Name] Architecture

## Overview

[What this component does and why it exists]

## Process Flow

[Step-by-step flow through the component, with diagram if helpful]

## Component Structure

[Package/module layout with responsibilities]

## Key Abstractions

[Important interfaces, patterns, or domain objects]

## API Contracts

[Endpoints exposed and consumed, with request/response shapes]

## State Management

[What state is persisted, where, and how]

## Error Handling

[Error categories, retry strategies, fallback behavior]

## Configuration

[Externalized properties and their purpose]

## Testing Strategy

[What types of tests exist and what they cover]

## Monitoring

[Key metrics, alerts, dashboards]
```

Only include sections that are relevant to the component.

## Quality Checklist

Before considering a planning task complete, verify:

- [ ] All documents are internally consistent (no contradictions between PRD, C4, ADRs)
- [ ] Technical terms are defined in the glossary
- [ ] Scope boundaries are explicit (in-scope and out-of-scope)
- [ ] Every functional requirement has testable acceptance criteria
- [ ] Architecture decisions have documented alternatives
- [ ] Diagrams match the text descriptions
- [ ] Tracker issues are referenced where known
- [ ] No placeholder text remains (ask the user rather than guessing)
