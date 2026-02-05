---
name: Bug
about: Report undesired behavior using BDD to describe current vs expected
title: "Bug: "
labels: bug
assignees: ''
---

## Current Condition (Undesired Behavior)

```gherkin
Given <preconditions>
When <action or trigger>
Then <what actually happens — the bug>
```

## Target Condition (Expected Behavior)

```gherkin
Given <same preconditions>
When <same action or trigger>
Then <what should happen instead>
```

## Steps to Reproduce

1. <!-- First step -->
2. <!-- Next step -->
3. <!-- Observe the bug -->

## Environment

- **Branch/Version:** <!-- e.g., main, v1.2.3 -->
- **OS:** <!-- e.g., macOS 14.0, Ubuntu 22.04 -->
- **Node version:** <!-- e.g., 20.x -->

## Additional Context

<!-- Screenshots, logs, error messages, or any other relevant information -->
