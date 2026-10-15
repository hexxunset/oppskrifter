---
name: commit
description: Create a git commit following the Conventional Commits standard (lowercase imperative subject, valid type/scope, co-author trailer). Use whenever the user asks to commit changes, create a commit, or draft/suggest a commit message.
---

**CRITICAL:** This skill MUST be invoked automatically whenever:

- The user asks for a commit message or to commit changes
- Claude needs to draft or create a git commit

**Behavior:**

- **Suggest mode:** When user says "suggest commit message" → analyze changes and provide message only
- **Commit mode:** When user says "commit" or "create commit" → suggest message and ask for confirmation before committing
- **NEVER commit** without explicit user confirmation unless user says "commit" directly

## Git Commit Conventions (Embedded)

Follow Conventional Commits.
(reference: https://www.conventionalcommits.org/en/v1.0.0/#specification)

### Commit Message Format

```
type(scope): subject
```

### Required Rules - Subject Line

- ✅ **MUST start with lowercase letter**
- ✅ MUST use imperative mood (present tense): "add" not "added" or "adds"
- ✅ MUST NOT end with a period
- ✅ MUST be ≤ 72 characters
- ❌ NO capitalization of first word
- ❌ NO sentence case
- ❌ NO trailing punctuation

### Commit Types

Use one of these types:

- `build`: Build system changes
- `docs`: Documentation only
- `feat`: A new feature
- `fix`: A bug fix
- `perf`: Performance improvements
- `refactor`: Code refactoring without feature/fix changes
- `revert`: Reverting a previous commit
- `style`: Code style changes (formatting, semicolons, etc.)
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependency updates

### Scope (Optional)

Use a short scope naming the affected component/module/area:

- `(auth)`, `(api)`, `(parser)` — lowercase, matches a real part of the codebase
- Omit the scope entirely when the change is broad or no single area fits (e.g. `docs: update readme`) — do not invent one

### Correct Examples

✅ **Valid commit messages:**

```
feat(auth): add two-factor authentication
fix(user): handle null pointer in user service
docs: update installation guide
test(payment): add payment form validation tests
chore: update dependencies
refactor(filter): extract field filtering logic
perf(db): optimize database indexes
```

### Incorrect Examples

❌ **Invalid commit messages:**

```
feat(auth): Add two-factor authentication        ❌ starts with uppercase
fix: Handle null pointer.                         ❌ ends with period
Feat(api): handle error                           ❌ type capitalized
docs(Ui): update components                       ❌ scope capitalized
fix: Fixed the bug                                ❌ past tense ("fixed")
feat(auth): adds oauth support                    ❌ present tense ("adds")
```

## Workflow

When invoked, this skill will:

1. **Analyze the current git state:**

   ```bash
   git status
   git diff --cached
   git log --oneline -5
   ```

2. **Determine the commit type:**
   - `feat` — new functionality or feature
   - `fix` — bug fix
   - `test` — test-only changes
   - `refactor` — code restructuring without behavior change
   - `style` — formatting, whitespace, etc.
   - `docs` — documentation changes
   - `chore` — dependency updates, tooling
   - `perf` — performance improvements

3. **Identify the scope** (optional):
   - Use a short name for the affected component/module/area: `(auth)`
   - Omit the scope when the change is broad or no single area fits — do not invent one

4. **Draft the subject line:**
   - Start with lowercase letter
   - Use imperative mood: "add", "fix", "update", not "added", "fixed", "updates"
   - Keep under 72 characters
   - No trailing period
   - Be specific but concise

5. **Determine action based on user request:**
   - If user said **"suggest"** → show message only, do not commit
   - If user said **"commit"** → show message and ask for confirmation
   - If unclear → show message and ask if user wants to commit

6. **Only create the commit** after explicit user confirmation:
   ```bash
   git commit -m "$(cat <<'EOF'
   type(scope): subject

   Co-Authored-By: Claude <noreply@anthropic.com>
   EOF
   )"
   ```

## Important Rules

- **NEVER** commit without explicit user confirmation unless user says "commit" directly
- **NEVER** stage files automatically unless explicitly requested by the user
- **DO NOT** commit if there are no staged changes — inform the user instead
- **ALWAYS** validate the commit message against the conventions before creating the commit
- **ASK** the user for confirmation before executing `git commit`
- **ASK** the user if unclear about the appropriate type or scope
- **WARN** if the subject line exceeds 72 characters and suggest a shorter version
- **Suggest** improvements if the subject could be more concise or clear
- **DISTINGUISH** between "suggest message" (show only) vs. "commit" (show and ask to proceed)
- **INCLUDE** the co-author line in every commit:
  ```
  Co-Authored-By: Claude <noreply@anthropic.com>
  ```

## Examples of Good Subject Lines

Based on common change patterns:

- `feat(profile): always show part-time percentage`
- `fix(user): prevent null pointer in user service`
- `test(auth): add login flow validation`
- `refactor(date): extract date formatting logic`
- `perf(db): add database indexes for user lookup`
- `docs: update installation steps`
- `chore: upgrade dependencies`

## Co-Author Attribution

**Always** include the co-author line at the end of all commit messages:

```
Co-Authored-By: Claude <noreply@anthropic.com>
```

This is required for all commits created by Claude.

## Usage

**Suggest message only (no commit):**

- "suggest a commit message"
- "what should the commit message be?"
- "draft a commit message"
  → Shows suggested message, does NOT commit

**Suggest and ask to commit:**

- `/commit`
- "commit the changes"
- "create a commit"
  → Shows suggested message, asks for confirmation before committing

**Direct commit (expert mode):**

- "commit with message: [message]"
  → Uses provided message, still asks for confirmation

The skill analyzes changes, drafts compliant messages, and only commits after explicit user approval.

## Validation Checklist

Before creating a commit, verify:

- [ ] Subject starts with lowercase letter
- [ ] Subject uses imperative mood
- [ ] Subject has no trailing period
- [ ] Subject is ≤ 72 characters
- [ ] Type is one of the allowed types
- [ ] Scope (if used) names a real component/area; omitted when none fits
- [ ] Co-author line is included
- [ ] Staged changes match the commit message
