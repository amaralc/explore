#!/bin/bash
# Claude Code SessionStart Hook: Load project insights into context
#
# Reads docs/insights-short-term.md and docs/insights-long-term.md
# and injects their content as additional context at session start.

SHORT_TERM="$CLAUDE_PROJECT_DIR/docs/insights-short-term.md"
LONG_TERM="$CLAUDE_PROJECT_DIR/docs/insights-long-term.md"

SHORT_CONTENT=""
LONG_CONTENT=""

if [ -f "$SHORT_TERM" ]; then
  SHORT_CONTENT=$(cat "$SHORT_TERM")
fi

if [ -f "$LONG_TERM" ]; then
  LONG_CONTENT=$(cat "$LONG_TERM")
fi

jq -n --arg short "$SHORT_CONTENT" --arg long "$LONG_CONTENT" '{
  additionalContext: ("## Project Insights (loaded at session start)\n\n### Long-Term Insights\n" + $long + "\n\n### Short-Term Insights\n" + $short)
}'
