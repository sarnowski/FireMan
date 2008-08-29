// components defined in this file
const MANPROT_HANDLER_CONTRACTID 	= "@mozilla.org/network/protocol;1?name=man";
const MANPROT_HANDLER_CID 		= Components.ID("{c2e6b7ab-8141-45e9-8c84-e32a825bb105}");

// components used in this file
const NS_IOSERVICE_CID 				= "{9ac9e770-18bc-11d3-9337-00104ba0fd40}";
const NS_PREFSERVICE_CONTRACTID 	= "@mozilla.org/preferences-service;1";
const URI_CONTRACTID 				= "@mozilla.org/network/simple-uri;1";
const NS_WINDOWWATCHER_CONTRACTID 	= "@mozilla.org/embedcomp/window-watcher;1";
const STREAMIOCHANNEL_CONTRACTID 	= "@mozilla.org/network/stream-io-channel;1";

// interfaces used in this file
const nsIProtocolHandler    		= Components.interfaces.nsIProtocolHandler;
const nsIURI                		= Components.interfaces.nsIURI;
const nsISupports           		= Components.interfaces.nsISupports;
const nsIIOService          		= Components.interfaces.nsIIOService;
const nsIPrefService        		= Components.interfaces.nsIPrefService;
const nsIWindowWatcher      		= Components.interfaces.nsIWindowWatcher;
const nsIChannel            		= Components.interfaces.nsIChannel;


/***** ProtocolHandler *****/

function ManProtocolHandler(scheme)
{
	this.scheme = scheme;
}

// attribute defaults
ManProtocolHandler.prototype.defaultPort = -1;
ManProtocolHandler.prototype.protocolFlags = nsIProtocolHandler.URI_NORELATIVE;

ManProtocolHandler.prototype.allowPort = function(aPort, aScheme)
{
	return false;
}

ManProtocolHandler.prototype.newURI = function(aSpec, aCharset, aBaseURI)
{
	var uri = Components.classes[URI_CONTRACTID].createInstance(nsIURI);
	uri.spec = aSpec;
	return uri;
}

ManProtocolHandler.prototype.newChannel = function(aURI)
{
	var title = null;
	var category = null;
	var machine = null;

	var urlparts = aURI.spec.substr(aURI.spec.indexOf("://") + "://".length).split("/");

	// possible formats are:
	//   man://<title>
	//   man://<category>/<title>
	//   man://<category>/<machine>/<title>

	if (urlparts.length == 1) {
		title = urlparts[0];
	} else
	if (urlparts.length == 2) {
		category = urlparts[0];
		title = urlparts[1];
	} else
	if (urlparts.length == 3) {
		category = urlparts[0];
		machine = urlparts[1];
		title = urlparts[2];
	}

	dump("requested manual page: " + title + " (c: " + category + "/m: " + machine + ")\n");

	var ioServ = Components.classesByID[NS_IOSERVICE_CID].getService();
	ioServ = ioServ.QueryInterface(nsIIOService);
	var uri = ioServ.newURI("http://man.cx/" + title + "(" + category + ")", null, null);
	var chan = ioServ.newChannelFromURI(uri);
	return chan;
}


/***** ManProtocolHandlerFactory *****/

function ManProtocolHandlerFactory(scheme)
{
	this.scheme = scheme;
}

ManProtocolHandlerFactory.prototype.createInstance = function(outer, iid)
{
	if(outer != null) throw Components.results.NS_ERROR_NO_AGGREGATION;

	if(!iid.equals(nsIProtocolHandler) && !iid.equals(nsISupports))
		throw Components.results.NS_ERROR_INVALID_ARG;

	return new ManProtocolHandler(this.scheme);
}

var factory_man = new ManProtocolHandlerFactory("man");

/***** ManModule *****/

var ManModule = new Object();

ManModule.registerSelf = function(compMgr, fileSpec, location, type)
{
	compMgr = compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);

	// register protocol handlers
	compMgr.registerFactoryLocation(MANPROT_HANDLER_CID,
					"MAN protocol handler",
					MANPROT_HANDLER_CONTRACTID,
					fileSpec, location, type);
}

ManModule.unregisterSelf = function(compMgr, fileSpec, location)
{
	compMgr = compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);

	// unregister our components
	compMgr.unregisterFactoryLocation(MANPROT_HANDLER_CID, fileSpec);
}

ManModule.getClassObject = function(compMgr, cid, iid)
{
	if(!iid.equals(Components.interfaces.nsIFactory))
		throw Components.results.NS_ERROR_NOT_IMPLEMENTED;

	if(cid.equals(MANPROT_HANDLER_CID)) return factory_man;

	throw Components.results.NS_ERROR_NO_INTERFACE;
}

ManModule.canUnload = function(compMgr)
{
	return true;    // our objects can be unloaded
}

/***** Entrypoint *****/

function NSGetModule(compMgr, fileSpec)
{
    return ManModule;
}
