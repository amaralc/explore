---
name: create-issue
description: Create a GitHub issue linked to a milestone, team, and optionally a parent issue
argument-hint: <title> [--milestone <name-or-number>] [--team <name>] [--parent <issue-number>] [--label <label>]
disable-model-invocation: true
---

# Create Issue

Create a GitHub issue in `amaralc/explore` and link it to a milestone, project team, and optionally a parent issue (sub-issue).

## Available context

### Milestones
!`gh api repos/amaralc/explore/milestones --jq '.[] | "#\(.number) \(.title)"' 2>/dev/null`

### Labels
!`gh api repos/amaralc/explore/labels --jq '.[].name' 2>/dev/null | tr '\n' ', '`

### Project Teams
!`gh api graphql -f query='{ node(id: "PVT_kwHOAergc84BAFUg") { ... on ProjectV2 { fields(first: 30) { nodes { ... on ProjectV2SingleSelectField { name options { id name } } } } } } }' --jq '.data.node.fields.nodes[] | select(.name == "Team") | .options[] | "\(.name) (\(.id))"' 2>/dev/null`

## Arguments

Parse the following arguments from `$ARGUMENTS`:

- **Title**: The issue title (required, first positional argument or quoted string)
- **--milestone**: Milestone name or number (optional)
- **--team**: Project team name — one of: kernel, people, things (optional)
- **--parent**: Parent issue number for sub-issue linking (optional)
- **--label**: Label to apply, can be repeated (optional)
- **--body**: Issue body content (optional, if not provided generate a reasonable body based on the title and labels)

## Procedure

Follow these steps exactly:

### 1. Create the issue

```bash
gh issue create --repo amaralc/explore \
  --title "<title>" \
  --label "<label>" \
  --milestone "<milestone-title>" \
  --body "<body>"
```

Capture the issue URL and extract the issue number.

### 2. Add to Explore project and set team

If `--team` is provided:

1. Get the issue node ID:
   ```bash
   gh api repos/amaralc/explore/issues/<number> --jq '.node_id'
   ```

2. Add to the Explore project (ID: `PVT_kwHOAergc84BAFUg`):
   ```bash
   gh api graphql -f query='mutation { addProjectV2ItemById(input: {projectId: "PVT_kwHOAergc84BAFUg", contentId: "<node_id>"}) { item { id } } }'
   ```

3. Set the Team field (field ID: `PVTSSF_lAHOAergc84BAFUgzgy_nmQ`) using the option ID from the context above:
   ```bash
   gh api graphql -f query='mutation { updateProjectV2ItemFieldValue(input: {projectId: "PVT_kwHOAergc84BAFUg", itemId: "<item_id>", fieldId: "PVTSSF_lAHOAergc84BAFUgzgy_nmQ", value: {singleSelectOptionId: "<option_id>"}}) { projectV2Item { id } } }'
   ```

### 3. Link as sub-issue (if --parent provided)

1. Get the parent issue node ID:
   ```bash
   gh api repos/amaralc/explore/issues/<parent_number> --jq '.node_id'
   ```

2. Link using the addSubIssue mutation:
   ```bash
   gh api graphql -f query='mutation { addSubIssue(input: {issueId: "<parent_node_id>", subIssueId: "<child_node_id>"}) { issue { id } subIssue { id } } }'
   ```

### 4. Report results

Print a summary with:
- Issue URL
- Milestone
- Team assignment
- Parent issue link (if applicable)