#!/bin/sh

jar=$1
if [ -z "$jar" ]; then
	echo "Usage: $0 <jarfile>" >&2
	exit 1
fi

dirs=""

for dir in $(ls); do
	dirs="$dir $dirs"
done

echo "    JAR $jar"
zip -r $jar $dirs >/dev/null
exit $?
