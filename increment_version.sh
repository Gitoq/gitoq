#!/bin/bash

# Default version if version.txt doesn't exist or is empty
DEFAULT_VERSION="0.0.-1"

# Read the current version from version.txt or use the default version
CURRENT_VERSION=$(cat version.txt 2>/dev/null || echo "$DEFAULT_VERSION")

# Parse major, minor, and patch versions
IFS='.' read -r -a VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR="${VERSION_PARTS[0]}"
MINOR="${VERSION_PARTS[1]}"
PATCH="${VERSION_PARTS[2]}"

# Increment the patch version
PATCH=$((PATCH + 1))

# Assemble the new version
NEW_VERSION="$MAJOR.$MINOR.$PATCH"

# Update the version file
echo "$NEW_VERSION" > version.txt

# Output the new version
echo "Version updated to $NEW_VERSION"
