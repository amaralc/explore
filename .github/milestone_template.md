# Milestone Template v2 (Toyota Kata Target Condition)

> Based on [M01 - Target Condition: Zero critical/high vulnerabilities with automated detection and patching](https://github.com/amaralc/explore/milestone/1)

Use this template when creating a new GitHub milestone. Copy the description section into the milestone description field.

---

## Milestone Title

`Target Condition: <concise outcome statement>`

**Naming convention:** `M<number> - <title>` (e.g., `M01 - Reduce dependency vulnerability noise`)

## Labels

Assign relevant labels to the milestone issues:
- `target-condition` — marks the umbrella issue tracking the target condition itself
- Domain labels (e.g., `security`, `infra`, `dx`) — categorize the area of improvement

## Due Date

Set a 3-month horizon from the start date. Toyota Kata target conditions are time-bound.

---

## Description Template

Copy everything below into the GitHub milestone description:

```markdown
## Target Condition (Toyota Kata) — 3 months

### Direction

<1-2 sentences describing the desired shift. Use active voice: "Move from X to Y.">

### Qualitative Description

| Aspect | Current | Target |
|--------|---------|--------|
| Detection approach | <e.g., Reactive, manual> | <e.g., Automated, continuous> |
| Remediation process | <e.g., Ad-hoc, unbounded> | <e.g., SLA-driven, tracked> |
| Coverage scope | <e.g., Direct deps only> | <e.g., Full transitive tree> |
| CI enforcement | <e.g., No gates> | <e.g., Blocking audit gate> |
| Policy definition | <e.g., Undefined SLAs> | <e.g., Severity-based SLAs> |

### Outcome Metrics

| Metric | Current | Target |
|--------|---------|--------|
| <What you want to improve> | <Measured baseline> | <Concrete target> |
| <Coverage or count> | <Current value> | <Target value> |

### Process Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Mean Time to Detect (MTTD) | <Current> | <Target> |
| Mean Time to Remediate (MTTR) — critical | <Current> | <Target> |
| Mean Time to Remediate (MTTR) — high | <Current> | <Target> |
| <Frequency or cadence metric> | <Current> | <Target> |
| <Quality or pass rate metric> | <Current> | <Target> |

### Obstacles (Known)

- <Constraint outside direct control>
- <Tool limitation>
- <Upstream dependency risk>
- <Known technical debt>
- <Third-party dependency issue>

### First Experiments

- [ ] <Smallest step that moves toward the target condition>
- [ ] <Address the most urgent items first>
- [ ] <Evaluate alternative tools or approaches>
- [ ] <Automate a currently manual process>
- [ ] <Establish baseline measurements>
```

---

## Linked Issues Structure

Each milestone should have:

1. **Umbrella issue** (label: `target-condition`) — tracks the overall target condition with the same description as the milestone. This issue stays open for the duration of the milestone.
2. **Experiment issues** — individual, actionable tasks derived from the "First Experiments" checklist and obstacles encountered along the way. Close these as experiments complete.

### Issue Linking Convention

- Reference the milestone number in issue titles or descriptions
- Use `Closes #N` in PR commit messages to auto-link PRs to experiment issues
- Branch naming: `fix/<issue-num>-<short-desc>` or `feat/<issue-num>-<short-desc>`

---

## Lifecycle

1. **Create milestone** with title, description (from template above), and due date
2. **Open umbrella issue** with `target-condition` label, assigned to the milestone
3. **Run first experiments** — open issues for each, link to milestone
4. **Review obstacles** — as new obstacles surface, add them to the umbrella issue and create experiment issues
5. **Measure progress** — update the Current column in all three tables as conditions change
6. **Close milestone** when target metrics are met or the time box expires (document outcomes either way)
