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
  "reason": "Before stopping, update the project insight docs:\n\n1. Read docs/insights-short-term.md and docs/insights-long-term.md\n2. Extract ONE key insight from this session (<=100 characters, most valuable/general)\n3. Add the single insight to the TOP of docs/insights-short-term.md with format: - [YYYY-MM-DD HH:MM UTC] <insight> (use UTC time)\n4. Remove the oldest insight from the bottom to maintain exactly 100 short-term insights\n5. Evaluate whether any short-term insights should be promoted to docs/insights-long-term.md based on long-term relevance and impact\n6. Keep only the top 100 long-term insights ordered by impact\n7. Renumber long-term list sequentially (1-100); short-term uses unnumbered bullet points\n8. Do not add duplicates of existing insights"
}
EOF
