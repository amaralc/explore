#!/bin/bash

last_tagged_commit=$(git for-each-ref --sort=-taggerdate --format '%(objectname)' refs/tags | head -n 1 | tail -n 1)
git describe $last_tagged_commit

second_last_tagged_commit=$(git for-each-ref --sort=-taggerdate --format '%(objectname)' refs/tags | head -n 2 | tail -n 1)
git describe $second_last_tagged_commit

commit_messages_between_two_tags=$(git log --pretty=format:'%s' $last_tagged_commit...$second_last_tagged_commit)

function extract_jira_issue_codes() {
    local text="$1"
    local regex='([A-Z]+-[0-9]+)'

    # Use grep with Perl-compatible regular expression (PCRE) to find all matches
    # of the regex in the text and concatenate them into a comma-separated string
    local matches=$(grep -oP "$regex" <<< "$text" | sort -u | tr '\n' ',')

    # Remove the trailing comma, if any
    matches=${matches%,}

    # Return
    echo "$matches"
}

comma_separated_issue_codes_between_last_two_tags=$(extract_jira_issue_codes "$commit_messages_between_two_tags")
echo "Issues between tags: $comma_separated_issue_codes_between_last_two_tags"
