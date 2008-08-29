// constants
const CLASS_ID = Components.ID('{%%APPUUID%%}');
const CLASS_NAME = 'A component to execute shell commands.';
const CONTRACT_ID = '%%XPCOM_SHELL%%';

const nsISupports = Components.interfaces.nsISupports;

//class constructor
function ShellExecuter() {
	// for javascript only purposes:
	this.wrappedJSObject = this;
};


//class definition
ShellExecuter.prototype = {

	/**
	 * Execute the command and return the output
	 */
	exec: function(command)
	{
		dump("$ " + command + "\n");

		// prepare output file to pipe to
		var outputfile = this.getTemporaryFile();

		// prepare command
		var args = ["-c", command + " > " + outputfile.path];

		// get the shell binary
		var shell = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		shell.initWithPath("/bin/sh");

		// create a new process
		var process = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);
		process.init(shell);

		// run the process
		// first param has to be true to block until the command
		// ends.
		process.run(true, args, args.length);

		// now read in the output
		var is = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
		is.init(outputfile, 0x01, 00400, null);

		var sis = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
		sis.init(is);

		var output = sis.read(sis.available());

		// clean up
		outputfile.remove(false);
		return output;
	},

	getTemporaryFile: function()
	{
		var file = Components.classes["@mozilla.org/file/directory_service;1"]
					.getService(Components.interfaces.nsIProperties)
					.get("TmpD", Components.interfaces.nsIFile);

		file.append("FFShellExecuter.out");
		file.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0600);
		return file;
	},

	QueryInterface: function(aIID)
	{
		if (!aIID.equals(nsISupports)) {
			throw Components.results.NS_ERROR_NO_INTERFACE;
		}
		return this;
	}
};


//class factory
var ShellExecuterFactory = {
	createInstance: function (aOuter, aIID)
	{
		if (aOuter != null) {
			throw Components.results.NS_ERROR_NO_AGGREGATION;
		}
		return (new ShellExecuter()).QueryInterface(aIID);
	}
};


//module definition (xpcom registration)
var ShellExecuterModule = {
	registerSelf: function(aCompMgr, aFileSpec, aLocation, aType)
	{
		aCompMgr = aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
		aCompMgr.registerFactoryLocation(CLASS_ID, CLASS_NAME, CONTRACT_ID, aFileSpec, aLocation, aType);
	},

	unregisterSelf: function(aCompMgr, aLocation, aType)
	{
		aCompMgr = aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
		aCompMgr.unregisterFactoryLocation(CLASS_ID, aLocation);
	},

	getClassObject: function(aCompMgr, aCID, aIID)
	{
		if (!aIID.equals(Components.interfaces.nsIFactory)) {
			throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
		}

		if (aCID.equals(CLASS_ID)) {
			return ShellExecuterFactory;
		}

		throw Components.results.NS_ERROR_NO_INTERFACE;
	},

	canUnload: function(aCompMgr) { return true; }
};

//module initialization
function NSGetModule(aCompMgr, aFileSpec) { return ShellExecuterModule; }

