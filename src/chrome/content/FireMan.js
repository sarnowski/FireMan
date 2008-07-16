var Shell;

var %%APPNAME%%_db = null;

function %%APPNAME%%_initDB()
{
	// get our ShellExecuter component for global usage
	Shell = Components.classes['@new-thoughts.org/%%APPNAME%%/shellexecuter;1'].createInstance();

	%%APPNAME%%_db = Shell.exec("test");
}
