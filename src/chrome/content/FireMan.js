var Shell = null;

var FM_OS = null;


function FM_trim(str)
{
	return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

function FM_exec(command)
{
	if (Shell == null) {
		// nessecary to use XP components within JS
		netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");

		// get out components
		Shell = Components.classes['%%XPCOM_SHELL%%'].getService().wrappedJSObject;
	}

	return Shell.exec(command);
}

function FM_exect(command)
{
	return FM_trim(FM_exec(command));
}

function FM_getList(searchTerm)
{
	if (searchTerm == '') {
		searchTerm = ' ';
	}

	// query the apropos database for the searchterm
	dump("searching for '" + searchTerm + "'...\n");
	var command = "apropos '" + searchTerm + "' | sort -f";
	var output = FM_exec(command);

	// now parse the output
	var lines = output.split("\n");

	// regex to find  "<name> (<category>) - <description>"
	// where name can be a list of comma+space seperated words
	// and description a free-formable string; category can
	// only be a word (no whitespace)
	var lineFormat = /^(.+)\s+\((.+)\)\s+-\s+(.+)$/;


	// prepare data object to fill it later
	var data = new Array();

	for (n in lines) {
		var line = FM_trim(lines[n]);

		if (line == '') {
			continue;
		}

		var entry = lineFormat.exec(line);
		if (entry == null) {
			// malformed line, ignore
			continue;
		}

		// we have a valid line
		var aliases = entry[1].split(',');
		var title = FM_trim(aliases[0]);
		var category = entry[2];
		var machine = null;
		var description = entry[3];

		// on OpenBSD there are manual pages marked with
		// e.g. 8/i386 for machine specific pages, parse
		// them
		var i = category.indexOf("/");
		if (i > 0) {
			machine = category.substr(i + 1);
			category = category.substr(0, i);
		}

		// the first keyword is our main keyword, throw it away
		aliases.shift();

		// search if we already have this main man page
		// and if so, add it as a machine addition
		var added = false;
		if (machine != null) {
			for (d in data) {
				if (data[d]["title"] == title && data[d]["category"] == category) {
					data[d]["machines"][data[d]["machines"].length] = machine;
					added = true;
				}
			}
		}
		if (!added) {
			var page = new Array();
			page["title"] = title;
			page["category"] = category;
			page["description"] = description;
			page["machines"] = new Array();
			page["aliases"] = aliases;

			data[data.length] = page;
		}
	}

	return data;
}

