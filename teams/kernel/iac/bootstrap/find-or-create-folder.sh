#!/bin/bash

# This script finds or creates a GCP folder and returns its ID
# Parameters:
#   $1: display_name  - The name to display for the folder
#   $2: parent_type   - "organizations" or "folders"
#   $3: parent_id     - The parent organization or folder ID

# Check jq dependency
if ! command -v jq &>/dev/null; then
    echo "Error: jq is required but not installed." >&2
    echo "Install: brew install jq (macOS) or apt-get install jq (Ubuntu)" >&2
    exit 1
fi

display_name="$1"
parent_type="$2"  # "organizations" or "folders"
parent_id="$3"

# List existing folders under parent
if [ "$parent_type" = "organizations" ]; then
    existing_folders=$(gcloud resource-manager folders list \
        --organization="$parent_id" \
        --format="json" 2>/dev/null)
else
    existing_folders=$(gcloud resource-manager folders list \
        --folder="$parent_id" \
        --format="json" 2>/dev/null)
fi

# Check if folder exists (use jq for reliable JSON parsing)
folder_id=$(echo "$existing_folders" | \
    jq -r ".[] | select(.displayName==\"$display_name\") | .name" | \
    sed 's|folders/||')

if [ -n "$folder_id" ] && [ "$folder_id" != "null" ]; then
    echo "  ✓ Folder '$display_name' exists (ID: $folder_id)" >&2
    echo "$folder_id"
    exit 0
fi

# Create folder
echo "  → Creating folder '$display_name'..." >&2
if [ "$parent_type" = "organizations" ]; then
    result=$(gcloud resource-manager folders create \
        --display-name="$display_name" \
        --organization="$parent_id" \
        --format="json" 2>/dev/null)
else
    result=$(gcloud resource-manager folders create \
        --display-name="$display_name" \
        --folder="$parent_id" \
        --format="json" 2>/dev/null)
fi

folder_id=$(echo "$result" | jq -r '.name' | sed 's|folders/||')

if [ -z "$folder_id" ] || [ "$folder_id" = "null" ]; then
    echo "Error: Failed to create folder '$display_name'" >&2
    exit 1
fi

echo "  ✓ Created folder '$display_name' (ID: $folder_id)" >&2
echo "$folder_id"
