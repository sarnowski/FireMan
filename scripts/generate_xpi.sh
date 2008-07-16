#!/bin/sh

xpi=$1
if [ -z "$xpi" ]; then
	echo "Usage: $0 <xpifile> <jarfile>" >&2
	exit 1
fi

jar=$2
if [ -z "$jar" ]; then
	echo "Usage: $0 <xpifile> <jarfile>" >&2
	exit 1
fi

echo "    XPI $(basename $xpi)"
zip $xpi LICENSE install.rdf chrome.manifest chrome/$jar >/dev/null
exit $?
