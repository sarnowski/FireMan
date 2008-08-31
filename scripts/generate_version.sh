#!/bin/sh

# Copyright (c) 2008 Tobias Sarnowski <sarnowski@new-thoughts.org>
#
# Permission to use, copy, modify, and distribute this software for any
# purpose with or without fee is hereby granted, provided that the above
# copyright notice and this permission notice appear in all copies.
#
# THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
# WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
# MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
# ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
# WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
# ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
# OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

# generate version from git
version=$(git-describe --abbrev=4 HEAD 2>/dev/null)

# dashes are ugly, use dots
version=$(echo $version | sed 's/-/./g')

if [ "$1" != "--full" ]; then
	version=$(echo $version | sed 's/\.[^\.]*$//')
fi

# mark as dirty if uncommitted parts are in the source
if [ ! -z "$(git-diff-index --name-only HEAD --)" ]; then
	version="$version-dirty"
fi

# print out
echo $version
