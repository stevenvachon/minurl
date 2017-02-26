"use strict";
const anyMatch = require("any-match");
const cloneURL = require("cloneurl");
const deepFreeze = require("deep-freeze-node");
const defined = require("defined");
const evaluateValue = require("evaluate-value");
const isURL = require("isurl");
const stripWWW = require("strip-www");

const defaultPorts = { "ftps:":990, "git:":9418, "scp:":22, "sftp:":22, "ssh:":22 };
const directoryIndexes = ["index.html"];
const emptyQueryValue = /([^&\?])=&/g;
const encodedSpace = /%20/g;
const multipleAmpersand = /&+/g;
const multipleSlashes = /\/{2,}/g;
const queryNames = [];
const trailingAmpersand = /&$/;
const trailingEquals = /([^&\?])=$/;
const trailingQuestion = /\?#?(?:.+)?$/;

const carefulProfile = 
{
	clone: true,
	defaultPorts,
	directoryIndexes,
	plusQueries: true,
	queryNames,
	removeDefaultPort: true,
	removeDirectoryIndex: false,
	removeEmptyDirectoryNames: false,
	removeEmptyHash: true,
	removeEmptyQueries:     filterSafe,
	removeEmptyQueryNames:  filterSafe,
	removeEmptyQueryValues: filterSafe,
	removeHash: false,
	removeQueryNames: false,
	removeQueryOddities: true,
	removeRootTrailingSlash: true,
	removeTrailingSlash: false,
	removeWWW: false,
	sortQueries: filterSafe,
	stringify: true
};

const commonProfile = 
{
	clone: true,
	defaultPorts,
	directoryIndexes,
	plusQueries: true,
	queryNames,
	removeDefaultPort: true,
	removeDirectoryIndex: filterCommon,
	removeEmptyDirectoryNames: false,
	removeEmptyHash: true,
	removeEmptyQueries: filterSpecCompliant,
	removeEmptyQueryNames:  filterSafe,
	removeEmptyQueryValues: filterSafe,
	removeHash: false,
	removeQueryNames: false,
	removeQueryOddities: true,
	removeRootTrailingSlash: true,
	removeTrailingSlash: false,
	removeWWW: filterCommon,
	sortQueries: filterSpecCompliant,
	stringify: true
};



function defaultValue(customOptions, optionName, ...args)
{
	const defaultOption = evaluateValue(commonProfile[optionName], ...args);

	if (customOptions != null)
	{
		return defined( evaluateValue(customOptions[optionName], ...args), defaultOption );
	}
	else
	{
		return defaultOption;
	}
}



function filterCommon(url)
{
	return url.protocol==="http:" || url.protocol==="https:";
}



function filterSafe(url)
{
	return url.protocol === "mailto:";
}



function filterSpecCompliant(url)
{
	return filterSafe(url) || url.protocol==="http:" || url.protocol==="https:" || url.protocol==="ws:" || url.protocol==="wss:";
}



function minURL(url, options)
{
	if (!isURL.lenient(url))
	{
		throw new TypeError("Invalid URL");
	}

	if (defaultValue(options, "clone", url))
	{
		url = cloneURL(url);
	}

	if (defaultValue(options, "removeDefaultPort", url))
	{
		const defaultPorts = defaultValue(options, "defaultPorts");

		if (defaultPorts[url.protocol] === parseInt(url.port))
		{
			url.port = "";
		}
	}

	if (defaultValue(options, "removeDirectoryIndex", url))
	{
		const directoryIndexes = defaultValue(options, "directoryIndexes");
		const pathnameSegments = url.pathname.split("/");
		const lastPathnameSegment = pathnameSegments[pathnameSegments.length - 1];

		if (anyMatch(lastPathnameSegment, directoryIndexes))
		{
			url.pathname = url.pathname.slice(0, -lastPathnameSegment.length);
		}
	}

	if (defaultValue(options, "removeEmptyDirectoryNames", url))
	{
		url.pathname = url.pathname.replace(multipleSlashes, "/");
	}

	if (defaultValue(options, "removeHash", url))
	{
		url.hash = "";
	}
	else if (url.hash==="" && url.href.endsWith("#"))
	{
		if (defaultValue(options, "removeEmptyHash", url))
		{
			// Force `href` to update
			url.hash = "";
		}
	}
	
	if (url.search !== "")
	{
		// If not a partial implementation
		if (url.searchParams !== undefined)
		{
			// Also, if not a partial implementation
			if (url.searchParams.sort !== undefined)
			{
				if (defaultValue(options, "sortQueries", url))
				{
					url.searchParams.sort();
				}
			}

			const removeEmptyQueries     = defaultValue(options, "removeEmptyQueries", url);
			const removeEmptyQueryNames  = defaultValue(options, "removeEmptyQueryNames", url);
			const removeEmptyQueryValues = defaultValue(options, "removeEmptyQueryValues", url);

			if (removeEmptyQueries || removeEmptyQueryNames || removeEmptyQueryValues)
			{
				// Cache original params
				const params = Array.from(url.searchParams);

				// Clear all params
				// TODO :: construct a new `URLSearchParams` instance when feasible, to avoid mutliple re-stringifcations
				// NOTE :: https://github.com/nodejs/node/issues/10481
				url.search = "";

				// Rebuild params
				// NOTE :: `searchParams.delete()` will not remove individual values
				params.filter( function([name, value])
				{
					const isRemovableQuery      = removeEmptyQueries     && name==="" && value==="";
					const isRemovableQueryName  = removeEmptyQueryNames  && name==="" && value!=="";
					const isRemovableQueryValue = removeEmptyQueryValues && name!=="" && value==="";

					return !isRemovableQuery && !isRemovableQueryName && !isRemovableQueryValue;
				})
				.forEach(([name, value]) => url.searchParams.append(name, value));
			}

			if (defaultValue(options, "removeQueryNames", url))
			{
				const queryNames = defaultValue(options, "queryNames");

				Array.from(url.searchParams.keys()).forEach( function(param)
				{
					if (anyMatch(param, queryNames))
					{
						url.searchParams.delete(param);
					}
				});
			}
		}
	}

	if (defaultValue(options, "removeQueryOddities", url))
	{
		if (url.search === "")
		{
			if (trailingQuestion.test(url.href))
			{
				// Force `href` to update
				url.search = "";
			}
		}
		else
		{
			url.search = url.search
			.replace(emptyQueryValue, "$1&")
			.replace(multipleAmpersand, "&")  // TODO :: remove when "whatwg-url" has `URLSearchParams`
			.replace(trailingAmpersand, "")
			.replace(trailingEquals, "$1");
		}
	}

	if (url.search !== "")
	{
		if (defaultValue(options, "plusQueries", url))
		{
			url.search = url.search.replace(encodedSpace, "+");
		}
	}

	if (defaultValue(options, "removeWWW", url))
	{
		// TODO :: "www.www.domain.com" doesn't get stripped correctly
		url.hostname = stripWWW(url.hostname);
	}

	if (!defaultValue(options, "stringify"))
	{
		return url;
	}
	else if (defaultValue(options, "removeTrailingSlash", url))
	{
		// Avoid changing "//" to "/"
		if (url.pathname.endsWith("/") && !url.pathname.endsWith("//"))
		{
			return url.href.replace(url.host + url.pathname, url.host + url.pathname.slice(0,-1));
		}
	}
	else if (defaultValue(options, "removeRootTrailingSlash", url))
	{
		if (url.pathname === "/")
		{
			return url.href.replace(url.host + url.pathname, url.host);
		}
	}
	
	return url.href;
}



minURL.CAREFUL_PROFILE = carefulProfile;
minURL.COMMON_PROFILE = commonProfile;



module.exports = deepFreeze(minURL);
