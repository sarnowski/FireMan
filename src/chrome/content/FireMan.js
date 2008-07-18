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
	var command = "apropos '" + searchTerm + "'";
	var output = FM_exec(command);

	// now parse the output
	var lines = output.split("\n");

	// regex to find  "<name> (<category>) - <description>"
	// where name can be a list of comma+space seperated words
	// and description a free-formable string; category can
	// only be a word (no whitespace)
	var lineFormat = /^(.+)\s+\((.+)\)\s+-\s+(.+)$/;


	// prepare data object to fill it later
	var data = null;

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

		// we have a valid line, now sort it in
		var title = entry[1]
		var category = FM_getOSCategoryAlias(entry[2])
		var description = entry[3];

		//alert("Entry:  " + title + " (" + category + "): " + description);
		// TODO fill in this data in a structure
	}

	return data;
}

