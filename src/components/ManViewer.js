/*
 * Copyright (c) 2008 Tobias Sarnowski <sarnowski@new-thoughts.org>
 *
 * Permission to use, copy, modify, and distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

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


function disableHTML(textchar)
{
	if (textchar == '<') {
		return '&lt;';
	} else if (textchar == '>') {
		return '&gt;';
	} else if (textchar == '&') {
		return '&amp;';
	} else {
		return textchar;
	}
}

function transformMan2HTML(manoutput, man_title, man_category)
{
	var htmloutput = '';

	var first_line = true;
	var char_after_first_line = false;

	var on_bold = false;
	var on_underline = false;
	for (var n = 0; n < manoutput.length; n++) {
		var s = manoutput.substr(n, 1);
		var c = s.charCodeAt(0);

		var s_next = '';
		var c_next = 0;
		if (n < manoutput.length - 1) {
			s_next = manoutput.substr(n + 1, 1);
			c_next = s_next.charCodeAt(0);
		}

		var s_nextnext = '';
		var c_nextnext = 0;
		if (n < manoutput.length - 2) {
			s_nextnext = manoutput.substr(n + 2, 1);
			c_nextnext = s_nextnext.charCodeAt(0);
		}

		var s_nextnextnext = '';
		var c_nextnextnext = 0;
		if (n < manoutput.length - 3) {
			s_nextnextnext = manoutput.substr(n + 3, 1);
			c_nextnextnext = s_nextnextnext.charCodeAt(0);
		}

		var s_prev = '';
		var c_prev = 0;
		if (n > 0) {
			s_prev = manoutput.substr(n - 1, 1);
			c_prev = s_prev.charCodeAt(0);
		}

		// start parsing

		if (s == '\n') {
			// new line, close the old one
			// clear bold/underline
			if (first_line) {
				// strip the first line
				htmloutput = '';
				first_line = false;
			} else {
				if (on_bold) {
					htmloutput += '</span>';
					on_bold = false;
				}
				if (on_underline) {
					htmloutput += '</span>';
					on_underline = false;
				}
				htmloutput += "\n";
			}

		} else if (s == '+' && c_next == 8 && s_nextnext == '+' && c_nextnextnext == 8) {
			if (on_underline) {
				htmloutput += '</span>';
				on_underline = false;
			}
			if (!on_bold) {
				htmloutput += '<span class="man_bold">';
				on_bold = true;
			}
			htmloutput += '* '; // it's a bullet
			n += 7;

		} else if (c == 8) {
			// should be already parsed
			continue;

		} else if (s == '_' && c_next == 8) {
			// underline
			if (on_bold) {
				htmloutput += '</span>';
				on_bold = false;
			}
			if (!on_underline) {
				htmloutput += '<span class="man_underline">';
				on_underline = true;
			}
			htmloutput += disableHTML(s_nextnext);
			n += 2;
		} else if (c_next == 8 && s_nextnext == s) {
			// bold
			if (on_underline) {
				htmloutput += '</span>';
				on_underline = false;
			}
			if (!on_bold) {
				htmloutput += '<span class="man_bold">';
				on_bold = true;
			}
			htmloutput += disableHTML(s);
			n += 2;
		} else {
			if (on_bold) {
				htmloutput += '</span>';
				on_bold = false;
			}
			if (on_underline) {
				htmloutput += '</span>';
				on_underline = false;
			}
			htmloutput += disableHTML(s);
		}

	}
	var tmp = htmloutput.replace(/^\s\s*/, '').replace(/\s\s*$/, '');

	// seperate special titles
	tmp = tmp.replace(/^<span class="man_bold">(.*)<\/span> <span class="man_bold">(.*)<\/span>/g, '<h1><a name="$1 $2" href="#bottomnav">$1 $2</a></h1>');
	tmp = tmp.replace(/\n+<span class="man_bold">(.*)<\/span> <span class="man_bold">(.*)<\/span>/g, '<h1><a name="$1 $2" href="#bottomnav">$1 $2</a></h1>');
	tmp = tmp.replace(/^<span class="man_bold">(.*)<\/span>/g, '<h1><a name="$1" href="#bottomnav">$1</a></h1>');
	tmp = tmp.replace(/\n+<span class="man_bold">(.*)<\/span>/g, '<h1><a name="$1" href="#bottomnav">$1</a></h1>');

	// link links
	tmp = tmp.replace(/([\-.\w]+)\((\w+)\)/g, '<a href="man://$2/$1">$1($2)</a>');

	// get os type and customize design
	var shell = Components.classes['%%XPCOM_SHELL%%'].getService().wrappedJSObject;
	var os = shell.exect("uname");
	switch (os) {
		case "OpenBSD":
			break;
		case "NetBSD":
			break;
		case "FreeBSD":
			break;
		case "Darwin":
			break;
		case "Linux":
			break;
		default:
			os = false;
			break;
	}

	htmloutput  = '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"\n';
	htmloutput += '    "http://www.w3.org/TR/html4/loose.dtd">\n\n';
	htmloutput += '<html>\n';
	htmloutput += '    <head>\n';
	htmloutput += '        <title>' + man_title;
	if (man_category) {
		htmloutput += '(' + man_category + ')';
	}
	htmloutput += '</title>\n';
	htmloutput += '        <link rel="shortcut icon" type="image/png" href="resource://fireman/img/logo16x16.png"/>\n';
	htmloutput += '        <link rel="stylesheet" type="text/css" href="resource://fireman/css/screen.css" media="screen"/>\n';
	htmloutput += '        <link rel="stylesheet" type="text/css" href="resource://fireman/css/print.css" media="print"/>\n';
	htmloutput += '    </head>\n';
	htmloutput += '    <body>\n';
	htmloutput += '        <div id="main">\n';
	htmloutput += '            <div id="header">\n';
	htmloutput += '                <p>\n';
	if (os) {
		htmloutput += '                    <img src="resource://fireman/img/os/' + os + '.png" alt="' + os + '" title="FireMan uses the ' + os + ' manpages."/>\n';
		htmloutput += '                    ' + os + ' Manual Page<br/>\n';
	} else {
		htmloutput += '                    <img src="resource://fireman/img/os/default.png" alt="FireMan" title="FireMan uses the manpages."/>\n';
		htmloutput += '                    Manual Page<br/>\n';
	}
	htmloutput += '                    <strong>' + man_title;
	if (man_category) {
		htmloutput += '(' + man_category + ')';
	}
	htmloutput += '</strong>\n';
	htmloutput += '                </p>\n';
	htmloutput += '            </div>\n';
	htmloutput += '            <div id="manpage">\n';
	htmloutput += '                <pre>\n';
	htmloutput += tmp;
	htmloutput += '                </pre>\n';
	htmloutput += '            </div>\n';
	htmloutput += '            <div id="footer">\n';
	htmloutput += '                This manual page is rendered by <a href="#" title="The FireMan Homepage">FireMan</a> <a href="#" title="The FireMan Homepage"><img src="resource://fireman/img/logo24x24.png" alt="FireMan" /></a>\n';
	htmloutput += '            </div>\n';
	htmloutput += '        </div>\n';
	htmloutput += '    </body>\n';
	htmloutput += '</html>\n\n';
	return htmloutput;
}

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

	// now get the man output and parse it

	// get out components
	var shell = Components.classes['%%XPCOM_SHELL%%'].getService().wrappedJSObject;

	var mancmd = 'man';
	if (category) {
		mancmd = mancmd + ' -s ' + category;
	}
	if (machine) {
		mancmd = mancmd + ' -S ' + machine;
	}
	mancmd = mancmd + ' ' + title;
	var output = shell.exect(mancmd);

	output = transformMan2HTML(output, title, category);

	var stream = Components.classes["@mozilla.org/io/string-input-stream;1"].createInstance(Components.interfaces.nsIStringInputStream);
	stream.setData(output, output.length);

	// create a channel to stream it into firefox browser
	var channel = Components.classes["@mozilla.org/network/input-stream-channel;1"].createInstance(Components.interfaces.nsIInputStreamChannel);
	channel.setURI(aURI);
	channel.contentStream = stream;
	return channel;
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
