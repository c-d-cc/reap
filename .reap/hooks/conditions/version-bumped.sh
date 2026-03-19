#!/usr/bin/env bash
# True if package.json version differs from the last git tag
# Exit 0 = version was bumped, Exit 1 = same version
last_tag=$(git describe --tags --abbrev=0 2>/dev/null)
if [ -z "$last_tag" ]; then
  exit 1
fi
tag_version="${last_tag#v}"
pkg_version=$(node -e "console.log(require('./package.json').version)" 2>/dev/null)
if [ -z "$pkg_version" ]; then
  exit 1
fi
if [ "$tag_version" != "$pkg_version" ]; then
  exit 0
else
  exit 1
fi
