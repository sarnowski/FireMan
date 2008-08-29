function FM_fillTree(searchTerm)
{
	try {
		var tree = document.getElementById("ManualPageTree");
		var treec = document.getElementById("ManualPageTreeContent");

		var data = FM_getList(searchTerm);

		if (data.length == 0) {
			FM_showError("nothing found!");
		} else {
			FM_clearManualTree();

			for (var n = 0; n < data.length; n++) {
				FM_addManual(data[n]["title"], data[n]["category"], data[n]["description"], data[n]["machines"], data[n]["aliases"]);
			}
		}
		treec = document.getElementById("ManualPageTreeContent");

		// if there are only a few results, open alle categories
		if (data.length < 25) {
			for (var n = 0; n < treec.childNodes.length; n++) {
				treec.childNodes[n].setAttribute("open", "true");
			}
		} else

		// if it is only 1 category, open it
		if (treec.childNodes.length == 1) {
			treec.childNodes[0].setAttribute("open", "true");
		}

	} catch (ex) {
		dump("FireMan Exception:\n" + ex);
	}
}

function FM_clearManualTree()
{
	var tree = document.getElementById("ManualPageTreeContent");
	while (tree.childNodes.length > 0) {
		tree.removeChild(tree.childNodes[0]);
	}
}

function FM_showError(msg)
{
	FM_clearManualTree();

	var tc = document.createElement("treecell");
	tc.setAttribute("id", "FM-treecell-error");
	tc.setAttribute("label", msg);
	tc.setAttribute("src", "chrome://fireman/skin/images/error.png");

	var tr = document.createElement("treerow");
	tr.setAttribute("id", "FM-treerow-error");
	tr.appendChild(tc);

	var ti = document.createElement("treeitem");
	ti.setAttribute("id", "FM-treeitem-error");
	ti.appendChild(tr);

	var tree = window.document.getElementById("ManualPageTreeContent");
	tree.appendChild(ti);
}

function FM_addCategory(category)
{
	var tc;
	var tr;
	var ti;
	var tch;

	// prepare the category
	category = FM_getOSCategoryAlias(category);
	categorydesc = FM_getOSCategoryDescription(category);
	if (!categorydesc) {
		categorydesc = category;
	} else {
		categorydesc = categorydesc; // + " [" + category + "]";
	}

	tc = document.createElement("treecell");
	tc.setAttribute("id", "FM-category-" + category + "-treecell");
	tc.setAttribute("label", categorydesc);
	tc.setAttribute("src", "chrome://fireman/skin/images/book.png");

	tr = document.createElement("treerow");
	tr.setAttribute("id", "FM-category-" + category + "-treerow");
	tr.appendChild(tc);

	tch = document.createElement("treechildren");
	tch.setAttribute("id", "FM-category-" + category + "-children");

	ti = document.createElement("treeitem");
	ti.setAttribute("id", "FM-category-" + category);
	ti.setAttribute("container", "true");
	ti.setAttribute("fm_type", "category");
	ti.setAttribute("fm_category", category);
	ti.appendChild(tr);
	ti.appendChild(tch);

	// search the right place to insert
	var tree = document.getElementById("ManualPageTreeContent");

	var categories = FM_getOSCategories();
	var catsToReappend = new Array();

	for (var ci = 0; ci < tree.childNodes.length; ci++) {
		var found = false;

		if (!found) {
			for (ca in categories) {
				if (ca == category) {
					found = true;
					break;
				}
				if ("FM-category-" + ca == tree.childNodes[ci].getAttribute("id")) {
					break;
				}
			}
		}
		if (found) {
			catsToReappend[catsToReappend.length] = tree.childNodes[ci];
		}
	}

	for (ci = 0; ci < catsToReappend.length; ci++) {
		tree.removeChild(catsToReappend[ci]);
	}
	tree.appendChild(ti);
	for (ci = 0; ci < catsToReappend.length; ci++) {
		tree.appendChild(catsToReappend[ci]);
	}

	return tch;
}

function FM_addManual(title, category, description, machines, aliases)
{
	var tc;
	var tr;
	var ti;

	var tch = document.getElementById("FM-category-" + category + "-children");
	if (!tch) {
		tch = FM_addCategory(category);
	}

	// add manual to the category
	tc = document.createElement("treecell");
	tc.setAttribute("id", "FM-page-" + category + "-" + title + "-treecell");
	tc.setAttribute("label", title + " - " + description);
	tc.setAttribute("src", "chrome://fireman/skin/images/page_white_text.png");

	tr = document.createElement("treerow");
	tr.setAttribute("id", "FM-page-" + category + "-" + title + "-treerow");
	tr.appendChild(tc);

	ti = document.createElement("treeitem");
	ti.setAttribute("id", "FM-page-" + category + "-" + title);
	ti.setAttribute("fm_type", "page");
	ti.setAttribute("fm_title", title);
	ti.setAttribute("fm_category", category);
	ti.setAttribute("fm_machine", '');
	ti.appendChild(tr);

	tch.appendChild(ti);


	if (machines.length + aliases.length > 0) {
		tch = document.createElement("treechildren");
		tch.setAttribute("id", "FM-page-" + category + "-" + title + "-children");

		ti.setAttribute("container", "true");
		ti.appendChild(tch);

		// add machine specific pages if available
		for (var n = 0; n < machines.length; n++) {
			tc = document.createElement("treecell");
			tc.setAttribute("id", "FM-page-" + category + "-" + machines[n] + "-" + title + "-treecell");
			tc.setAttribute("label", machines[n]);
			tc.setAttribute("src", "chrome://fireman/skin/images/page_white_gear.png");

			tr = document.createElement("treerow");
			tr.setAttribute("id", "FM-page-" + category + "-" + machines[n] + "-" + title + "-treerow");
			tr.appendChild(tc);

			ti = document.createElement("treeitem");
			ti.setAttribute("id", "FM-page-" + category + "-" + machines[n] + "-" + title);
			ti.setAttribute("fm_type", "page");
			ti.setAttribute("fm_title", title);
			ti.setAttribute("fm_category", category);
			ti.setAttribute("fm_machine", machines[n]);
			ti.appendChild(tr);

			tch.appendChild(ti);
		}

		// add aliases if available
		for (var n = 0; n < aliases.length; n++) {
			tc = document.createElement("treecell");
			tc.setAttribute("id", "FM-page-" + category + "-" + aliases[n] + "-" + title + "-treecell");
			tc.setAttribute("label", aliases[n]);
			tc.setAttribute("src", "chrome://fireman/skin/images/page_white_get.png");

			tr = document.createElement("treerow");
			tr.setAttribute("id", "FM-page-" + category + "-" + aliases[n] + "-" + title + "-treerow");
			tr.appendChild(tc);

			ti = document.createElement("treeitem");
			ti.setAttribute("id", "FM-page-" + category + "-" + aliases[n] + "-" + title);
			ti.setAttribute("fm_type", "page");
			ti.setAttribute("fm_title", title);
			ti.setAttribute("fm_category", category);
			ti.setAttribute("fm_machine", '');
			ti.appendChild(tr);

			tch.appendChild(ti);
		}
	}
}


function FM_showMan(tree)
{
	dump("show man..\n");
	var item = tree.view.getItemAtIndex(tree.currentIndex);

	if (item.getAttribute("fm_type") != "page") {
		// categories aren't handled atm
		return;
	}

	var title = item.getAttribute("fm_title");
	var category = item.getAttribute("fm_category");
	var machine = item.getAttribute("fm_machine");

	if (machine != '') {
		category = category + "/" + machine;
	}
	var manurl = "man://" + category + "/" + title;

	// FIXME as long as we don't have a protocol handler for man:// user http://man.cx/ to display
	manurl = "http://man.cx/" + title + "(" + category + ")";

	var browser = top.document.getElementById("content");
	browser.webNavigation.loadURI(manurl, Components.interfaces.nsIWebNavigation,null,null,null);
}
