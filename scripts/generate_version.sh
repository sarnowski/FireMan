#!/bin/sh

# generate version from git
version=$(git-describe --abbrev=4 HEAD 2>/dev/null)

# dashes are ugly, use dots
version=$(echo $version | sed 's/-/./g')

# mark as dirty if uncommitted parts are in the source
if [ ! -z "$(git-diff-index --name-only HEAD --)" ]; then
	version="$version-dirty"
fi

# print out
echo $version
