#!/bin/sh

# Generate GCP project ID from base name + random suffix
#
# Usage: sh generate-project-id.sh "basename"
#        or import as library: source generate-project-id.sh && generate_project_id "basename"
#
# Arguments:
#   $1 - base name for the project (e.g., "bootstrap", "api-gateway")
#
# Output:
#   Generated project ID (format: basename-XXXX where XXXX is 4 random hex chars)
#
# Constraints:
#   - Input base name must start with a letter
#   - Output project ID must be 6-30 characters
#   - GCP project IDs only allow: lowercase letters, digits, hyphens
#   - Long base names are truncated to fit within 30-char limit

generate_project_id() {
    local base_name="$1"

    # Sanitize: lowercase, remove invalid characters
    base_name=$(echo "$base_name" | tr '[:upper:]' '[:lower:]' | tr -cd 'a-z0-9-')

    # Validate starts with letter
    if ! echo "$base_name" | grep -q '^[a-z]'; then
        echo "Error: Project base name '$base_name' must start with a letter" >&2
        exit 1
    fi

    # Generate 4 random hex characters
    local random_suffix=$(openssl rand -hex 2)

    # Truncate base name if necessary (leave room for -XXXX suffix)
    if [ ${#base_name} -gt 25 ]; then
        base_name=$(echo "$base_name" | cut -c1-21)
        echo "Warning: Base name truncated to: $base_name" >&2
    fi

    # Construct project ID
    local project_id="${base_name}-${random_suffix}"

    # Validate length (6-30 characters)
    local length=${#project_id}
    if [ $length -lt 6 ] || [ $length -gt 30 ]; then
        echo "Error: Generated project ID '$project_id' has invalid length ($length chars). Must be 6-30." >&2
        exit 1
    fi

    echo "$project_id"
}

# If executed directly (not sourced), call the function with command-line arguments
if [ "${0##*/}" = "generate-project-id.sh" ]; then
    if [ -z "$1" ]; then
        echo "Error: Base name argument required" >&2
        echo "Usage: sh generate-project-id.sh <base-name>" >&2
        exit 1
    fi
    generate_project_id "$1"
fi
