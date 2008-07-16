// constants
const nsISupports = Components.interfaces.nsISupports;

const CLASS_ID = Components.ID("{%%APPUUID%%}");
const CLASS_NAME = "A component to execute shell commands.";
const CONTRACT_ID = "@new-thoughts.org/%%APPNAME%%/shellexecuter;1";


//class constructor
function ShellExecuter() {
	// nothing to do atm
};


//class definition
ShellExecuter.prototype = {

	exec: function(command)
	{
		return "CMD: " + command;
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
	createInstance: function ()
	{
		return new ShellExecuter();
	}
};


//module definition (xpcom registration)
var ShellExecuterModule = {
	_firstTime: true,

	registerSelf: function(aCompMgr, aFileSpec, aLocation, aType)
	{
		if (this._firstTime) {
			this._firstTime = false;
			throw Components.results.NS_ERROR_FACTORY_REGISTER_AGAIN;
		};
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

