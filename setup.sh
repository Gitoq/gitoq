#!/bin/bash

# Navigate to the root directory of your project where the setup.sh script is located. Then execute command './setup.sh' inside 'git bash'

# pre commit hooks
hooks_dir=".git/hooks"
hook_name="pre-commit"
hook_content='#!/bin/bash\n\n# Run version incrementation script\n./increment_version.sh\n\n# Stage the updated version file\ngit add version.txt\n\n# Proceed with the commit\nexit 0'
echo -e "$hook_content" > "$hooks_dir/$hook_name"
chmod +x "$hooks_dir/$hook_name"

# increment_version
increment_dir="."
increment_name="increment_version.sh"
increment_content='#!/bin/bash\n\n# Default version if version.txt doesn'\''t exist or is empty\nDEFAULT_VERSION="0.0.-1"\n\n# Read the current version from version.txt or use the default version\nCURRENT_VERSION=$(cat version.txt 2>/dev/null || echo "$DEFAULT_VERSION")\n\n# Parse major, minor, and patch versions\nIFS='\''.'\'' read -r -a VERSION_PARTS <<< "$CURRENT_VERSION"\nMAJOR="${VERSION_PARTS[0]}"\nMINOR="${VERSION_PARTS[1]}"\nPATCH="${VERSION_PARTS[2]}"\n\n# Increment the patch version\nPATCH=$((PATCH + 1))\n\n# Assemble the new version\nNEW_VERSION="$MAJOR.$MINOR.$PATCH"\n\n# Update the version file\necho "$NEW_VERSION" > version.txt\n\n# Output the new version\necho "Version updated to $NEW_VERSION"'
echo -e "$increment_content" > "$increment_dir/$increment_name"
chmod +x "$increment_dir/$increment_name"

# Inform the user
echo "increment version hook installed successfully."
