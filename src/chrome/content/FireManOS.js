/**
 * This file contains OS specific informations
 */

function FM_getOS()
{
	if (FM_OS == null) {
		FM_OS = FM_exect("uname");
	}
	return FM_OS;
}

function FM_getOSCategoryAlias(category)
{
	var aliases = new Array();

	// default aliases (from OpenBSD)
	aliases["X11"] = "X11R6";

	if (aliases["" + category]) {
		return aliases["" + category];
	} else {
		return category;
	}
}

function FM_getOSCategories()
{
	var categories;
	var aliases;

	// default categories (from OpenBSD)
	categories["1"] = "General commands (tools and utilities).";
	categories["2"] = "System calls and error numbers.";
	categories["3"] = "Libraries.";
	categories["3f"] = "Fortran programmer's reference guide.";
	categories["3p"] = "Perl programmer's reference guide.";
	categories["4"] = "Device drivers.";
	categories["5"] = "File formats.";
	categories["6"] = "Games.";
	categories["7"] = "Miscellaneous.";
	categories["8"] = "System maintenance and operation commands.";
	categories["9"] = "Kernel internals.";
	categories["X11R6"] = "X Window System.";
	categories["local"] = "Pages located in /usr/local.";
	categories["n"] = "Tcl/Tk commands.";

	return categories;
}
