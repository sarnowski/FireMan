var Shell = null;

var %%APPNAME%%_db = null;

function %%APPNAME%%_exec(command)
{
	if (Shell == null) {
		// nessecary to use XP components within JS
		netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");

		// get out components
		Shell = Components.classes['%%XPCOM_SHELL%%'].getService().wrappedJSObject;
	}

	return Shell.exec(command);
}

function %%APPNAME%%_exect(command)
{
	var str = %%APPNAME%%_exec(command);
	return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

function %%APPNAME%%_initDB()
{
	try {
		var command = "apropos afterboot";
		var output = %%APPNAME%%_exec(command);
		alert(output);
	} catch (ex) {
		alert("%%APPNAME%% Exception: " + ex);
	}
}
