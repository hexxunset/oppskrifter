---
name: sparring-plan
description: Build a plan via two sparring sub-agents (Proposer + Reviewer) iterating until they converge. Two modes (`implementation` / `feature`), switchable reviewer lens. Uses Opus — expensive; invoke for high-stakes or architecturally novel planning, otherwise prefer vanilla plan mode. Trigger phrases: "sparring-plan", "lag en plan med sparringspartnere", "bruk sparring-flyten", "spar med to agenter".
---

Orchestrate two sub-agents in a Proposer ↔ Reviewer ping-pong to produce a high-quality plan. The main agent (you) is the **active conductor** — not a passive relay. Sub-agents never talk directly; everything flows through you so you can log, summarise, push back on persona drift, and pull the user in when needed.

## When to use — and when NOT to

Sparring is **expensive** (Opus on both agents, up to 5 rounds, growing context). Use it deliberately.

**Use sparring when:**

- High-stakes work — security, PII, payment, audit, regulated, public endpoints.
- Architecturally novel — new modules, service-boundary changes, picking between patterns the codebase hasn't committed to.
- Cross-team / multi-service feature where scope or dependency tension is real.
- A vanilla single-pass plan already missed something important and you need a second adversarial pass.
- Cost of being wrong (rework, incident, regulatory exposure) clearly exceeds the Opus token cost.

**Use vanilla plan mode (`EnterPlanMode`) instead when:**

- Small or medium feature with clear AC — one careful pass is enough.
- You can be the reviewer yourself (most everyday tasks). User-as-critic + plan mode = same convergence at ~1/20 the cost.
- Well-known codebase, well-trodden pattern.
- AC is fuzzy — sparring on fuzzy input produces _expensively_ fuzzy output. Tighten the brief first.
- You need to iterate fast — sparring takes minutes, plan mode takes seconds.

If in doubt, push back to the user with one line before invoking: _"Do you want a sparring round (more expensive, ~5 rounds on Opus) or plain plan mode? Sparring is worth it mainly for high-risk or architecturally novel work."_

## Modes

The user picks a mode at invocation. Default = `implementation`.

| Mode                       | When                                                                          | Output                                                          | "Truth" lives in                                       | Push-back evidence                                                               |
| -------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------- |
| `implementation` (default) | A defined feature with AC; you need a file-by-file technical plan             | File-by-file plan + tests + risks                               | The codebase                                           | Code: grep result, file:line, dead-code argument, existing pattern reference     |
| `feature`                  | A problem, vision, or user need; you need scope, AC, dependencies, sequencing | Scope doc: in/out, AC, dependencies, sequencing, open questions | PRDs, tracker issues, prior features, stakeholder docs | References: PRD §, similar past feature, ADR, stakeholder commitment, policy doc |

**Argument parsing.** First token after the skill name: if it matches a known mode (`feature` / `implementation`), use it as mode. Otherwise assume `implementation` and treat the token as lens. Remaining tokens = lens.

Edge cases:

- **Multiple lens tokens** (e.g. `sparring-plan security architecture`): use the first known lens, ignore the rest, and tell the user which one was picked.
- **Unknown lens token**: fall back to the mode's default lens AND tell the user explicitly: _"Unknown lens `<input>`. Using default `<default>` for `<mode>` mode. Valid: `<list>`."_
- **Examples:**
  - `sparring-plan` → implementation + risk-and-edges (defaults).
  - `sparring-plan security` → implementation + security.
  - `sparring-plan feature` → feature + scope-minimalist (default).
  - `sparring-plan feature value-skeptic` → feature + value-skeptic.

## Reviewer lenses — pick at invocation

Different sets per mode. If user did not specify a lens, use the default for the chosen mode.

### Implementation-mode lenses

| Lens                       | When to pick                                                                             | Primary concerns                                                                                                                            |
| -------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `risk-and-edges` (default) | Most implementation tasks. Broadest net.                                                 | Failure modes, edge cases, security holes, retry/idempotency, error paths, observability gaps.                                              |
| `security`                 | Tasks with PII, authn/authz, payment data, regulated audit, public endpoints.            | Input validation, authn/authz, data exposure, injection, secrets, dependency risk, log leakage, error-message info disclosure, audit trail. |
| `architecture`             | Tasks introducing new modules, changing service boundaries, or picking between patterns. | Cohesion/coupling, layering, fit with codebase conventions, where code belongs (local vs. shared library), reusability, testability.        |
| `performance`              | Tasks affecting hot paths, batch jobs, DB queries, caching, async processing.            | Latency, throughput, allocation, query complexity, N+1, blocking calls, caching, backpressure.                                              |

### Feature-mode lenses

| Lens                         | When to pick                                                        | Primary concerns                                                                                                                  |
| ---------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `scope-minimalist` (default) | Most feature tasks. Catches over-scoping.                           | What is MVP? Smallest viable cut? What is Phase 2? Can this be split? What are we adding "while we're at it" that doesn't belong? |
| `value-skeptic`              | Tasks where user value or ROI is unclear.                           | Who uses this? What alternatives exist? Cost of NOT doing it? Is the hypothesis testable? Are we building the right thing?        |
| `dependency-risk`            | Cross-team or multi-service features; sequenced rollouts.           | Blocking dependencies, cross-team coordination, timeline assumptions, fallback if upstream is late, sequencing risk.              |
| `stakeholder-fit`            | Features touching commitments, regulation, partner contracts, OKRs. | Existing commitments, regulatory constraints, OKR alignment, partner/customer expectations, audit/compliance posture.             |

Apply the chosen lens in the Reviewer prompt verbatim.

## Roles

### Proposer — persona varies by mode

**Implementation mode — "Skeptical Senior Developer":**

- Pragmatic, conservative, allergic to over-engineering.
- Optimises for: clarity, maintainability, fit with existing codebase conventions, smallest change that solves the problem.
- Pushes back on requirements that smell wrong; flags assumptions explicitly.
- Reads the codebase before proposing — never plans in a vacuum.
- **When rejecting a Reviewer item, must cite code-level evidence** (grep result, file path + line, dead-code reachability argument, existing-pattern reference). "I disagree" without evidence is not allowed.

**Feature mode — "Pragmatic Product Engineer":**

- Balances user value, business reality, and technical feasibility — not pure engineering elegance.
- Proposes scope cuts, MVPs, phased rollouts. Default to the smallest cut that proves the hypothesis or delivers the user value.
- Reads PRDs, related tracker issues, similar past features, ADRs **before proposing** — never scopes in a vacuum.
- Flags assumptions about user behaviour, market, dependencies, and commitments explicitly.
- **When rejecting a Reviewer item, must cite reference evidence** (PRD section, prior feature precedent, ADR, stakeholder commitment, policy doc). "I disagree" without a reference is not allowed.

### Reviewer — persona varies by lens (see tables above)

Both modes share the same reviewer rules:

- Does NOT rewrite the plan — only critiques and demands changes.
- Severity-tag every bullet (BLOCKER / SHOULD-FIX / NIT — see Convergence signals).
- Push-backs in round 2+ require evidence appropriate to the mode (code for implementation, references for feature).

Pick the persona text matching the user's chosen lens and paste it verbatim into the Reviewer prompt.

#### Implementation-mode personas

**`risk-and-edges`:** Hunts for what breaks under stress, what is missed in the happy path, and what causes silent failure. Security is part of this, but so are: race conditions, partial failure, retry storms, missing idempotency, observability blind spots, error paths that swallow context, edge inputs (empty, max-length, wrong type, concurrent).

**`security`:** Reviews every proposal through a security lens — input validation, authn/authz, data exposure, injection vectors, dependency risk, secrets handling, logging of sensitive data, error messages leaking info, rate limiting, audit trail. Also catches obvious correctness/architecture issues, but security is the primary lens.

**`architecture`:** Reviews proposal for fit with codebase conventions, layering (Controller → Service → Repository → Domain), cohesion/coupling, where code belongs (local utility vs. a shared library), and testability. Pushes back on incidental complexity and on putting code in the wrong place.

**`performance`:** Reviews proposal for latency, throughput, allocation, query complexity, N+1, blocking calls in reactive paths, caching, backpressure, batch sizing. Cites measurable concerns where possible.

#### Feature-mode personas

**`scope-minimalist`:** Hunts for over-scoping, gold-plating, unjustified Phase 1 inclusions, and missing splits. Asks: "what would a Phase 0 look like? what's the half-baked version that proves the hypothesis? what is the smallest visible behaviour that delivers value? what are we including 'while we're at it' that doesn't belong here?"

**`value-skeptic`:** Questions user value, ROI, and whether we're building the right thing. Asks: "who actually uses this? what's the alternative the user has today? what's the measurable success signal? what's the cost of NOT doing it? is the hypothesis falsifiable from the MVP?"

**`dependency-risk`:** Hunts for blocking dependencies, sequencing issues, and cross-team coordination gaps. Asks: "what does this require from team X? what's the timeline assumption? what blocks if Y is late? is there a fallback path? are dependencies discovered or just assumed?"

**`stakeholder-fit`:** Reviews against existing commitments, regulatory constraints, OKRs, partner/customer expectations. Asks: "did we commit to A by date Z? does this conflict with policy B? what's the regulator's posture? does this match the partner contract / SLA / OKR?"

## Convergence signals

Every Reviewer response MUST end with one of these markers on its own line:

```
VERDICT: APPROVED
```

or

```
VERDICT: CHANGES_REQUIRED
- BLOCKER: <bullet> [...]
- SHOULD-FIX: <bullet> [...]
- NIT: <bullet> [...]
```

**Severity tags are mandatory.** Reviewer must tag every bullet:

- `BLOCKER` — ship-stopping risk; must be addressed (or formally accepted as risk by the user) before APPROVED.
- `SHOULD-FIX` — real concern, but Proposer may address OR document as accepted-risk with rationale.
- `NIT` — preference / style / future-proofing. Proposer may accept or reject without further argument.

Convergence rule: in round N+1, the Reviewer may output `VERDICT: APPROVED` when the Proposer's revision has resolved every `BLOCKER` from round N and every `SHOULD-FIX` is either resolved or carries a documented accepted-risk note in the plan. APPROVED itself does not carry bullets — if anything is still open, output `CHANGES_REQUIRED` with the remaining bullets instead.

If a sub-agent needs user input to proceed, it MUST end with:

```
ESCALATE_TO_USER: <question for the user>
```

## Convergence pressure (rounds 2+)

In round 2 and later, the Reviewer's primary task is to verify that the previous round's bullets were adequately addressed. New objections are allowed but require:

- A `NEW-RISK:` prefix on the bullet
- Concrete evidence of harm — **mode-appropriate**:
  - Implementation mode: code-level (file path, line, what breaks, grep result)
  - Feature mode: reference (PRD section, prior feature ID, ADR, commitment doc)
- A severity tag

**The conductor — not the Proposer — enforces this filter.** Bullets without a `NEW-RISK:` prefix that did not appear on the Reviewer's prior bullet list are dropped before the Proposer ever sees them. The Reviewer prompt must state this rule explicitly so the Reviewer self-disciplines, but the conductor is the gate.

The conductor (you) also pushes back when the Reviewer abuses `NEW-RISK:`: **if round 2+ Reviewer produces more than 2 `NEW-RISK:` bullets where the evidence is missing, hand-wavy, or doesn't satisfy the mode-appropriate evidence rule (code for implementation, reference for feature)**, re-prompt the Reviewer in the next round with: "Drop the unsubstantiated NEW-RISK items and re-review only against your prior bullets. We are converging." Do not pass those bullets to the Proposer.

## Max rounds

**Hard cap: 5 rounds** (1 round = one Proposer turn + one Reviewer turn).

If round 5 ends with open BLOCKER bullets, you **must** stop the loop and ask the user via `AskUserQuestion` how to proceed (see Phase 4).

## Steps

### Phase 1 — Frame the task

1. **Determine mode.** Parse the argument: if first token is `feature` or `implementation`, use it; otherwise default to `implementation`. Tell the user which mode you're in if it wasn't explicit.
2. **Determine lens.** Use the user-supplied lens if valid for the chosen mode; else use the mode's default lens. Tell the user one line: "Using `<lens>` as the review angle. Say if you'd prefer <other options>."
3. **Confirm the planning task** with the user in one short sentence. If the request is vague, ask one clarifying question first — do NOT spawn agents on a fuzzy brief.
4. **Gather context appropriate to the mode:**
   - Implementation: relevant files, current branch state, issue AC, API spec, related code paths.
   - Feature: PRD (`docs/prd/prd.json` or similar), parent/sibling tracker issues, ADRs (`docs/adr/`), prior similar feature commits/PRs, stakeholder docs the user references.
5. **Show the user the gathered context briefly** before spawning, so they can correct anything missing.

### Phase 2 — Round 1 (fresh spawn)

**Model selection — always Opus for both sub-agents.** Pass `model: "opus"` on every `Agent` call in this skill (both Proposer and Reviewer, every round). Sparring is invoked precisely when planning quality matters — the adversarial loop, severity discipline, and `NEW-RISK:` filtering all depend on strong instruction-following. Cost is bounded by the 5-round hard cap. Do not downgrade to Sonnet "to save tokens" — if cheap is acceptable, the user shouldn't be invoking sparring at all.

6. **Spawn Proposer** with `Agent` (subagent_type: `general-purpose`, `model: "opus"`). The prompt must include:
   - The Proposer persona for the chosen mode (paste verbatim from Roles).
   - The task.
   - The relevant context you gathered.
   - Mode-specific instructions:
     - Implementation: read the codebase before proposing; output a concrete, file-by-file plan with rationale; flag assumptions and open questions.
     - Feature: read PRD/tracker/ADRs first; output a scope doc covering Goal, In-Scope (with rationale), Out-of-Scope/Deferred (with rationale), Acceptance Criteria, Dependencies (teams/services/decisions needed), Sequencing (if multi-phase), Open Questions, Assumptions.
   - If blocked on user input, end with `ESCALATE_TO_USER:`.
   - **Save the agent ID** returned by the tool.

   **If Proposer ends round 1 with `ESCALATE_TO_USER:`** — do NOT spawn Reviewer yet. Surface the question via `AskUserQuestion`, then resume Proposer with the answer (via `SendMessage` if available, else fresh `Agent` with manual context). Spawn Reviewer only after Proposer produces a real plan.

7. **Spawn Reviewer** with `Agent` (subagent_type: `general-purpose`, `model: "opus"`). The prompt must include:
   - The Reviewer persona for the chosen lens (paste verbatim from the matching mode's persona block).
   - The Proposer's plan verbatim.
   - The same task context.
   - Severity-tag rule (BLOCKER/SHOULD-FIX/NIT).
   - Mode-specific evidence rule for NEW-RISK items in later rounds (code vs. reference).
   - Explicit instructions: do NOT rewrite the plan; end with the `VERDICT:` marker; use `ESCALATE_TO_USER:` if blocked.
   - **Save the agent ID.**

   **If Reviewer ends with `ESCALATE_TO_USER:`** at any round (mid-critique included) — surface the question via `AskUserQuestion`, then resume Reviewer with the answer before processing any verdict.

### Phase 3 — Rounds 2–5

8. After each Reviewer turn, check the verdict:
   - `APPROVED` → go to Phase 5.
   - `CHANGES_REQUIRED` with zero BLOCKER and SHOULD-FIX either addressed or risk-accepted → also Phase 5.
   - `CHANGES_REQUIRED` with open BLOCKER or unaddressed SHOULD-FIX → continue the loop.
   - `ESCALATE_TO_USER:` → handle via `AskUserQuestion`, then resume the same agent with the user's answer.

9. **Conductor filtering (apply BEFORE sending to Proposer):**
   - Drop any round 2+ bullet that did not appear on the Reviewer's prior bullet list AND lacks a `NEW-RISK:` prefix. (New objections must be flagged as such; quietly-introduced new bullets are dropped.)
   - Drop any `NEW-RISK:` bullet whose evidence is missing or doesn't satisfy the mode-appropriate evidence rule (code for implementation, reference for feature).
   - If more than 2 `NEW-RISK:` bullets fail the evidence check, re-prompt the Reviewer first ("Drop the unsubstantiated NEW-RISK items and re-review only against your prior bullets. We are converging.") rather than just filtering silently.
   - Pass remaining bullets verbatim — do not paraphrase critiques.

10. **Send Reviewer's filtered feedback to Proposer.** Use `SendMessage` if available with the saved agent ID; otherwise spawn a fresh `Agent` (`subagent_type: general-purpose`, `model: "opus"`) and pass conversation context manually (see Tooling fallback). Message contents:
    - Reviewer's filtered critique (verbatim, severity tags intact).
    - Instruction: revise to address each BLOCKER and SHOULD-FIX, OR push back with mode-appropriate evidence (code for implementation, reference for feature). NIT items can be accepted or dismissed at will.
    - From round 2: **diff format only**. Output the changed sections + a short "Changes from round N-1" changelog. Do NOT repeat the full plan.

11. **Send Proposer's revision to Reviewer.** Use `SendMessage` if available, else fresh `Agent` (`subagent_type: general-purpose`, `model: "opus"`). Message contents:
    - Proposer's revised plan (or diff).
    - Reviewer's previous bullets, so it can verify each was addressed.
    - Instruction: re-review against your previous bullets first; only add `NEW-RISK:` items if you have evidence (mode-appropriate); output a fresh `VERDICT:` marker with severity tags.

12. Increment round counter. Loop back to step 8.

### Phase 4 — Stuck after round 5

13. If round 5 ends with open BLOCKER bullets, stop. Use `AskUserQuestion` to surface the disagreement:
    - Briefly summarise the unresolved BLOCKER points (≤3 bullets).
    - Offer concrete options: accept Proposer's latest plan; accept Reviewer's required changes as hard constraints; abandon and rescope; provide your own ruling.
    - Recommend one option (first in list, labelled `(Recommended)`).
14. After the user answers, optionally do one final round to fold the user's ruling into a clean plan, then go to Phase 5.

### Phase 5 — Deliver

15. Present the final agreed plan to the user as a single, clean document. Do NOT just paste the last Proposer message — synthesise. Format depends on mode:

    **Implementation-mode deliverable:**
    - Goal (one sentence).
    - File-by-file step-by-step plan with paths.
    - Tests (unit + integration).
    - Concerns the Reviewer raised that were folded in (grouped by severity).
    - Open questions / assumptions / accepted risks still on the table.
    - Sparring stats (see below).

    **Feature-mode deliverable:**
    - Goal & problem statement.
    - In-scope (with rationale per item).
    - Out-of-scope / deferred (with rationale per item — distinguish "Phase 2" from "won't do").
    - Acceptance criteria.
    - Dependencies (teams, services, decisions needed) with owners if known.
    - Sequencing (if multi-phase): phase definitions + entry/exit criteria.
    - Open questions / assumptions still on the table.
    - Sparring stats (see below).

    **Sparring stats (both modes):** rounds run, user escalations, BLOCKER/SHOULD-FIX bullets resolved, Proposer push-backs with evidence, Reviewer NEW-RISK items dropped by conductor.

16. If the user asked for a plan-mode plan, transition to plan mode (`EnterPlanMode`) at the end so they can approve via `ExitPlanMode`. Note: feature-mode deliverables are usually NOT plan-mode artefacts (they don't trigger code changes immediately) — confirm with the user before entering plan mode in feature mode.

## Tooling fallback — `SendMessage`

`SendMessage` is the documented continuation tool but is **not always present in the harness**. Behaviour:

- **If `SendMessage` is available** in your tool inventory: save the agent IDs returned by `Agent` and use `SendMessage` for rounds 2+. Preserves sub-agent context cheaply.
- **If `SendMessage` is NOT available**: fall back to spawning a fresh `Agent` per round and pass relevant prior context manually (Reviewer's prior bullets, Proposer's prior plan, user rulings). Functionally identical but **~3-5× token cost per round** in practice — the re-pasted context grows each round and runs on Opus. Tell the user once at start of Phase 3 if you have to fall back, so they know what they're buying.

Either way: **never silently skip the continuation** — wrong tool causes severe persona drift.

## Conductor responsibilities (you, the main agent)

You are not a passive relay. Active duties:

- **Pick the right mode and lens** based on user intent. If the user says "plan a new feature X" with no acceptance criteria yet, that's `feature` mode even if they didn't say so. Confirm with one line.
- **Filter Reviewer rounds 2+** per the convergence-pressure rule.
- **Push back on persona drift.** If Proposer starts agreeing with everything, restate persona and demand evidence on at least one bullet. If Reviewer starts proposing solutions, restate "do NOT rewrite the plan."
- **Watch for over-cautious convergence.** Proposer ("Skeptical Senior Developer") + `risk-and-edges` Reviewer can drift into defensive over-engineering — both sides keep adding safeguards and nobody pushes back. If Proposer accepts >80% of Reviewer bullets across 2 consecutive rounds without rejecting any, restate the Proposer persona and demand evidence-based dismissal of at least one item.
- **Demand brevity from round 2.** If Proposer's revision is >800 lines, ask for diff format only.
- **Surface ESCALATE_TO_USER immediately** — do not guess answers to keep the loop running. Policy/scope/classification questions belong to the user.
- **Track sparring stats per turn — do not reconstruct in Phase 5.** After each Proposer turn, increment push-backs-with-evidence. After each Reviewer turn, increment rounds, escalations, BLOCKER/SHOULD-FIX resolved, and NEW-RISK bullets dropped by your filter. Carry the running counters forward.

## Important

- **Pass critiques verbatim, not summarised.** Exception: round 2+ filter (drop unsubstantiated NEW-RISK) is a substantive editorial action, not paraphrasing.
- **Escalate eagerly.** If either agent asks for user input via `ESCALATE_TO_USER:`, surface it immediately.
- **Both agents read, neither writes.** No `Edit`/`Write`. Use `Read`/`Grep`/`Glob` (and `Bash` for `git log`/`gh issue view` etc. in feature mode).
- **The Reviewer is not a yes-man.** If round 1 returns `APPROVED` immediately with no critique, push back: re-prompt with "specifically check <lens>-relevant concerns you might have missed."
- **The Proposer is not a yes-man either.** If the Proposer accepts every bullet without pushing back on at least one with evidence, restate the persona.
- **Severity discipline.** If Reviewer puts everything in BLOCKER, push back: "re-tag your bullets — BLOCKER means ship-stopping risk only." The convergence machine relies on honest grading.
- **Mode discipline.** Don't ask a `feature`-mode agent to grep for code patterns — they should be reading PRDs and tracker issues. Don't ask an `implementation`-mode agent to question whether the feature should exist — that's already decided.
- **Never let the loop run silently past round 5.** Token cost is real, and the user wants control.
