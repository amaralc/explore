# Milestone Template v2 (Toyota Kata Challenge)

> Milestones define the challenge (desired outcome). Target conditions, obstacles, and experiments are tracked in linked issues.

Use this template when creating a new GitHub milestone. Copy the description section into the milestone description field.

---

## Milestone Title

`Challenge: <concise outcome statement that clearly describe in a catchy sentense the desired outcome>`

**Naming convention:** `<title>` (e.g., `A new lab every day`)

## Labels

Assign relevant labels to milestone issues:
- `target-condition` — issues tracking measurable current-vs-target metrics
- `obstacle` — issues documenting blockers to progress
- `experiment` — issues testing ideas to address obstacles
- Domain labels (e.g., `security`, `infra`, `dx`) — categorize the area of improvement

## Due Date

Set a 3-month horizon from the start date. Toyota Kata challenges are time-bound.

---

## Description Template

Copy everything below into the GitHub milestone description:

```markdown
# Vision

<1 sentence describing vision according to README.md>

# Target Outcome

<1-2 sentences describing the desired end state. Use active voice and focus on what success looks like.>

## Qualitative Targets

| Aspect | Target |
|--------|--------|
| Detection approach | <e.g., Automated, continuous> |
| Remediation process | <e.g., SLA-driven, tracked> |
| Coverage scope | <e.g., Full transitive tree> |
| CI enforcement | <e.g., Blocking audit gate> |
| Policy definition | <e.g., Severity-based SLAs> |

## Outcome Targets

| Metric | Target |
|--------|--------|
| <What you want to improve> | <Concrete target> |
| <Coverage or count> | <Target value> |

## Process Targets

| Metric | Target |
|--------|--------|
| Mean Time to Detect (MTTD) | <Target> |
| Mean Time to Remediate (MTTR) — critical | <Target> |
| Mean Time to Remediate (MTTR) — high | <Target> |
| <Frequency or cadence metric> | <Target> |
| <Quality or pass rate metric> | <Target> |

## Known Obstacles

- <High-level blocker categories — detail in obstacle issues>

## First Steps

- [ ] <Create target-condition issue(s) with current-vs-target metrics>
- [ ] <Identify and document initial obstacles>
```

---

## Linked Issues Structure

Each milestone should have:

1. **Target-condition issues** (label: `target-condition`) — track specific measurable targets with current-vs-target metrics. Multiple target conditions may exist per milestone.
2. **Obstacle issues** (label: `obstacle`) — document blockers with their own current-vs-target analysis.
3. **Experiment issues** (label: `experiment`) — individual, actionable tasks to address obstacles. Close as experiments complete.

### Issue Linking Convention

- Reference the milestone number in issue titles or descriptions
- Use `Closes #N` in PR commit messages to auto-link PRs to experiment issues
- Branch naming: `fix/<issue-num>-<short-desc>` or `feat/<issue-num>-<short-desc>`

---

## Lifecycle

1. **Create milestone** with title, description (from template above), and due date
2. **Open target-condition issues** with current-vs-target metrics, assigned to the milestone
3. **Document obstacles** — create obstacle issues for blockers identified
4. **Run experiments** — open experiment issues to address obstacles
5. **Measure progress** — update current values in target-condition and obstacle issues
6. **Close milestone** when success criteria are met or the time box expires (document outcomes)
