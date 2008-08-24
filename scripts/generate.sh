#/bin/sh

# get configfile to use
if [ -z "$1" ] || [ ! -r "$1" ]; then
	echo "Usage:  $0 <configfile>" >&2
	exit 1
fi

# get absolute path of project
cd $(dirname $1)
PROJECTDIR=$(pwd)

# set paths
configfile=$PROJECTDIR/$(basename $1)

SED=sed
# find the right "sed"
# use GNU sed if available, nessecary on OpenBSD
# cause sed don't supports -i (infile)
[ ! -z "$(whereis gsed)" ] && SED=gsed


# include config file for direct usage of variables
. $configfile

# reset paths to absolute
BUILDDIR=$PROJECTDIR/$BUILDDIR
SRCDIR=$PROJECTDIR/$SRCDIR

# create temporary directory
mkdir -p $BUILDDIR

# make the source dir the working dir so that
# find prints relative paths
cd $SRCDIR

# find out the actual version
VERSION=$(../scripts/generate_version.sh)
echo "    VSN $VERSION"

# process every listed file
find $FILES_TO_PROCESS | while read file; do
	if [ -d $file ]; then
		# create the directory
		echo "    DIR $file"
		mkdir -p $BUILDDIR/$file

	elif [ -f $file ]; then

		# what type of file do we have?
		filetype=$(file $file | cut -d' ' -f2)
		if [ "$filetype" = "ASCII" ]; then
			# copy over file
			echo "    GEN $file"
			cp $file $BUILDDIR/$file

			# insert version
			$SED "s/%%VERSION%%/$VERSION/g" -i $BUILDDIR/$file

			# parse the config file
			cat $configfile | while read line; do

				# strip comments
				line=$(echo $line | sed 's/#.*//')

				# sort out invalid lines
				if [ -z "$(echo $line | grep '=')" ]; then
					continue;
				fi

				# split line
				key=$(echo $line | cut -d'=' -f1)
				value=$(echo $line | cut -d'=' -f2-)

				# do not process special keywords
				case "$key" in
					"FILES_TO_PROCESS") continue;;
					"BUILDDIR") continue;;
				esac

				# strip " from strings
				value=$(echo $value | sed 's/^"//' | sed 's/"$//')

				# escape / to \/
				value=$(echo $value | sed 's/\//\\\//')

				# replace %%<key>%% with <value>
				$SED "s/%%$key%%/$value/g" -i $BUILDDIR/$file
			done
		else
			# no ASCII file
			# copy over file
			echo "    CPY $file"
			cp $file $BUILDDIR/$file
		fi
	fi
done
