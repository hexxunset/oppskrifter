---
name: ai-context-sync
description: Sync generic AI context (rules, agents, skills) from the personal-ai-context repo into the current project, driven by a per-project profile, and write a lockfile recording the source commit. Use when setting up AI context in a project, or when pulling the latest generic context updates into a project ("sync ai context", "update ai context", "refresh ai rules").
---

# AI Context Sync (downstream: personal-ai-context → project)

Copies the **generic, stack-appropriate** AI context into a target project. The set of files to copy is defined by a **profile** in the source repo (`profiles/<name>.txt`). Project-specific context is **never** managed by this skill — it lives in the project's own `PROJECT.md` and any project-only skills.

## Concepts

- **Source of truth:** the `personal-ai-context` repo (default `~/code/personal-ai-context`), branch `main`.
- **Profile:** `profiles/<name>.txt` in the source. Lists paths (relative to the source repo root) to copy into the project at the same relative path. Comments start with `#`. A path may be a file or a directory (copied recursively).
- **Lockfile:** `.ai-context.lock` written at the project root. Records the source commit SHA, profile name, sync date, and the list of synced paths — so drift ("N commits behind") is detectable.
- **Project-specific context stays in the project:** `PROJECT.md`, domain skills, domain rules. This skill must never delete or overwrite files that are not listed in the profile.

## Procedure

1. **Locate the source repo.** Default `~/code/personal-ai-context`. Confirm it exists and is a git repo. Check out `main` and `git pull` so you sync the latest (skip pull if offline; note it).

2. **Resolve the profile.**
   - If the project has `.ai-context.lock`, reuse the `profile` recorded there.
   - Else if the user named a profile, use it.
   - Else infer from the project directory name (`profiles/<dirname>.txt`).
   - If none matches, list available profiles (`profiles/*.txt`) and ask the user which to use, or help author a new one (see "Authoring a profile").

3. **Preflight.** Ensure the target project's git working tree is clean (or warn the user), so the sync is reviewable as a diff and reversible. Never proceed to overwrite with unstaged local edits to managed files without flagging them.

4. **Copy.** For each non-comment line in the profile, copy from `<source>/<path>` to `<project>/<path>`, creating parent directories as needed and overwriting existing files.
   - **Files:** overwrite in place.
   - **Directories:** mirror the source directory's _contents_ into the destination — do **not** nest. If the destination directory already exists, `cp -r src/dir dst/dir` will wrongly create `dst/dir/dir`. Use contents-copy semantics instead: `cp -r "<source>/<path>/." "<project>/<path>/"` (or `rsync -a --delete` to also drop stale files the source no longer has). Removing the destination dir first, then copying, also works.
   - A path listed in the profile that is missing in the source is an error — report it, don't silently skip.

5. **Do not delete project-specific files.** Only paths listed in the profile are touched. Everything else (notably `PROJECT.md`, domain skills, `.storecode/`, app code) is left exactly as-is.

6. **Write the lockfile** `<project>/.ai-context.lock` (see format below) with the source commit SHA, profile name, and the exact list of synced paths.

7. **Report.** Show `git status --short` / `git diff --stat` in the project so the user can review, plus a one-line summary: profile used, source commit, counts of files added/changed. Remind the user that edits to managed files must go upstream (to `personal-ai-context`), not be made in-place here, or the next sync will overwrite them.

## First adoption in a legacy project

A project that had AI context set up by an older/different scheme may keep files at **old paths or names** that the current layout supersedes (e.g. `.ai-rules/git-conventions.md` now lives at `.ai-rules/shared/git-conventions.md`; a `.claude/agents/` directory from a scheme that had agents; an old sync manifest is replaced by `.ai-context.lock`). The sync only _adds/overwrites_ the profile's paths — it never deletes — so these superseded files remain as stale duplicates. On first adoption, list them for the user and let the user decide what to delete. Do not delete files in the target project unless the user has named or approved them.

On **subsequent** syncs, files that were in the previous `.ai-context.lock` `files:` list but are no longer in the profile can be offered for pruning (the profile shrank) — again, only with user confirmation.

## Lockfile format (`.ai-context.lock`)

```
# AI context sync state — managed by the ai-context-sync skill. Do not edit by hand.
source = git@github.com:hexxunset/personal-ai-context (main)
commit = <full-sha>
profile = <name>
synced = <YYYY-MM-DD>
files:
  AGENTS.md
  .ai-rules/backend/java-spring.md
  ...
```

## Authoring a profile

Pick only what the project's stack needs. A profile is just the union of: entry points + shared rules + the stack's backend/frontend rules + the agents + the generic skills + the stack skills. Example structure (see `profiles/outfit-generator.txt`):

```
# <project> — <stack summary>
AGENTS.md
CLAUDE.md
GEMINI.md
.aiexclude
.ai-rules/shared/git-conventions.md
.ai-rules/backend/java-spring.md
.ai-rules/frontend/svelte.md
.claude/skills/commit
...
```

## Rules

- **Never** copy a project-specific file into `personal-ai-context`, and **never** overwrite a project's `PROJECT.md`.
- Edits to managed (synced) files belong upstream in `personal-ai-context` or in the project's `PROJECT.md` — never edit the synced copies in place.
- This skill is downstream only. Harvesting newly-generic content from an external/team source _into_ `personal-ai-context` is a separate, manual step.
