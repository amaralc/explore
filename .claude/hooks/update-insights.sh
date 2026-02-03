#!/bin/bash
# Claude Code Stop Hook: Update project insight docs
#
# On stop, blocks Claude and instructs it to update:
#   - docs/insights-short-term.md (recent findings, newest first, max 100)
#   - docs/insights-long-term.md  (top 100 by relevance/impact)
#
# On the second stop (stop_hook_active=true), allows Claude to stop
# to prevent infinite loops.

INPUT=$(cat)

STOP_HOOK_ACTIVE=$(echo "$INPUT" | jq -r '.stop_hook_active // false')

if [ "$STOP_HOOK_ACTIVE" = "true" ]; then
  exit 0
fi

cat <<'EOF'
{
  "decision": "block",
  "reason": "Before stopping, update the project insight docs:\n\n1. Read docs/insights-short-term.md and docs/insights-long-term.md\n2. Extract new insights from this session (each <=100 characters)\n3. Add new insights to the TOP of docs/insights-short-term.md with format: N. [YYYY-MM-DD HH:MM] <insight>\n4. Keep only the latest 100 short-term insights (remove from bottom if over 100)\n5. Evaluate whether any short-term insights should be promoted to docs/insights-long-term.md based on long-term relevance and impact\n6. Keep only the top 100 long-term insights ordered by impact\n7. Renumber both lists sequentially (1-100)\n8. Do not add duplicates of existing insights"
}
EOF
