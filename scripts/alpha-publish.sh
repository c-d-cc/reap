#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

# Get current version from package.json
VERSION=$(node -p "require('./package.json').version")

# Generate alpha version: base-alpha.timestamp
# e.g. 0.16.0-alpha.20260326143022
TIMESTAMP=$(date +%Y%m%d%H%M%S)
ALPHA_VERSION="${VERSION}-alpha.${TIMESTAMP}"

echo "Current version: ${VERSION}"
echo "Alpha version:   ${ALPHA_VERSION}"
echo ""

# Build
echo "Building..."
bash scripts/build.sh

# Set alpha version (no git tag)
npm version "${ALPHA_VERSION}" --no-git-tag-version

# Publish with alpha tag
echo "Publishing @alpha..."
npm publish --tag alpha --access public

# Restore original version
npm version "${VERSION}" --no-git-tag-version

echo ""
echo "Published: @c-d-cc/reap@${ALPHA_VERSION}"
echo "Install:   npm install -g @c-d-cc/reap@alpha"
