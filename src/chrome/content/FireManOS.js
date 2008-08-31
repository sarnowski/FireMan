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

/**
 * This file contains OS specific informations
 */

var FM_OS = null;

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

	// default aliases
	aliases["x"] = "X11R6";
	aliases["X11"] = "X11R6";

	if (aliases["" + category]) {
		return aliases["" + category];
	} else {
		return category;
	}
}

function FM_getOSCategories()
{
	var categories = new Array();

	// default categories (based on OpenBSD and http://en.wikipedia.org/wiki/Man_page)
	categories["0"] = "C library header files.";
	categories["1"] = "General commands (tools and utilities).";
	categories["2"] = "System calls and error numbers.";
	categories["3"] = "C library functions.";
	categories["3f"] = "Fortran programmer's reference guide.";
	categories["3p"] = "Perl programmer's reference guide.";
	categories["3G"] = "OpenGL programmer's reference guide.";
	categories["4"] = "Device drivers and special files.";
	categories["5"] = "File formats and conventions.";
	categories["6"] = "Games and screensavers.";
	categories["7"] = "Miscellaneous.";
	categories["8"] = "System maintenance and operation commands.";
	categories["9"] = "Kernel internals.";
	categories["X11R6"] = "X Window System.";
	categories["local"] = "Pages located in /usr/local.";
	categories["n"] = "Tcl/Tk commands.";

	return categories;
}

function FM_getOSCategoryDescription(category)
{
	var categories = FM_getOSCategories();

	// if the name contains a "/" we parse it as a machine specific one
	var c = category.split("/");
	category = c[0];
	var machine = c[1];

	var desc = categories[category];
	if (machine) {
		desc = "(" + machine + ") " + desc;
	}

	return desc;
}

