#!/bin/bash

# Check if an input file is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 input.json"
    exit 1
fi

# Check if the input file exists
if [ ! -f "$1" ]; then
    echo "File not found: $1"
    exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "jq is not installed. Please install jq to run this script."
    exit 1
fi

# Define the output filename by appending "_modified" before the .json extension
output="${1%.json}_modified.json"

# Use jq to remove "id" and "lesson_id" from each object in the JSON array
jq 'map(del(.id, .lesson_id, .created_at, .updated_at, .order))' "$1" > "$output"

# Check if jq processing was successful
if [ $? -ne 0 ]; then
    echo "Error processing JSON with jq."
    exit 1
fi

echo "Processed file saved as $output"