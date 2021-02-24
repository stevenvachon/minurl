"use strict";
const anyMatch = require("any-match");
const deepFreeze = require("deep-freeze-node");
const evaluateValue = require("evaluate-value");
const isURL = require("isurl");
const stripWWW = require("strip-www");

const defaultPorts = { "ftps:":990, "git:":9418, "scp:":22, "sftp:":22, "ssh:":22 };
const indexFilenames = ["index.html"];
const queryNames = [];

const EMPTY_QUERY_VALUE = /([^&\?])=&/g;
const ENCODED_SPACE = /%20/g;
const MULTIPLE_SLASHES = /\/{2,}/g;
const TRAILING_EQUALS = /([^&\?])=$/;
const TRAILING_QUESTION = /\?#?(?:.+)?$/;



const defaultValue = (customOptions, optionName, ...args) =>
{
	const defaultOption = evaluateValue(COMMON_PROFILE[optionName], ...args);

	return evaluateValue(customOptions?.[optionName], ...args) ?? defaultOption;
};



const filterCommon = url => url.protocol==="http:" || url.protocol==="https:";

const filterSafe = url => url.protocol === "mailto:";



const filterSpecCompliant = url =>
{
	return filterSafe(url) || url.protocol==="http:" || url.protocol==="https:" || url.protocol==="ws:" || url.protocol==="wss:";
};



const CAREFUL_PROFILE =
{
	clone: true,
	defaultPorts,
	indexFilenames,
	plusQueries: true,
	queryNames,
	removeAuth: false,
	removeDefaultPort: true,
	removeEmptyHash: true,
	removeEmptyQueries:     filterSafe,
	removeEmptyQueryNames:  filterSafe,
	removeEmptyQueryValues: filterSafe,
	removeEmptySegmentNames: false,
	removeHash: false,
	removeIndexFilename: false,
	removeQueryNames: false,
	removeQueryOddities: true,
	removeRootTrailingSlash: true,
	removeTrailingSlash: false,
	removeWWW: false,
	sortQueries: filterSafe,
	stringify: true
};

const COMMON_PROFILE =
{
	clone: true,
	defaultPorts,
	indexFilenames,
	plusQueries: true,
	queryNames,
	removeAuth: false,
	removeDefaultPort: true,
	removeEmptyHash: true,
	removeEmptyQueries: filterSpecCompliant,
	removeEmptyQueryNames:  filterSafe,
	removeEmptyQueryValues: filterSafe,
	removeEmptySegmentNames: false,
	removeHash: false,
	removeIndexFilename: filterCommon,
	removeQueryNames: false,
	removeQueryOddities: true,
	removeRootTrailingSlash: true,
	removeTrailingSlash: false,
	removeWWW: filterCommon,
	sortQueries: filterSpecCompliant,
	stringify: true
};



const minURL = (url, options) =>
{
	if (!isURL.lenient(url))
	{
		throw new TypeError("Invalid URL");
	}

	if (defaultValue(options, "clone", url))
	{
		url = new URL(url);
	}

	if (defaultValue(options, "removeAuth", url))
	{
		url.password = "";
		url.username = "";
	}

	if (defaultValue(options, "removeDefaultPort", url))
	{
		const defaultPorts = defaultValue(options, "defaultPorts");

		if (defaultPorts[url.protocol] === parseInt(url.port))
		{
			url.port = "";
		}
	}

	if (defaultValue(options, "removeIndexFilename", url))
	{
		const indexFilenames = defaultValue(options, "indexFilenames");
		const pathnameSegments = url.pathname.split("/");
		const lastPathnameSegment = pathnameSegments[pathnameSegments.length - 1];

		if (anyMatch(lastPathnameSegment, indexFilenames))
		{
			url.pathname = url.pathname.slice(0, -lastPathnameSegment.length);
		}
	}

	if (defaultValue(options, "removeEmptySegmentNames", url))
	{
		url.pathname = url.pathname.replace(MULTIPLE_SLASHES, "/");
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
				// @todo construct a new `URLSearchParams` instance when feasible, to avoid mutliple re-stringifcations
				// https://github.com/nodejs/node/issues/10481
				url.search = "";

				// Rebuild params
				// `searchParams.delete()` will not remove individual values
				params.filter(([name, value]) =>
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

				Array.from(url.searchParams.keys()).forEach(param =>
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
		if (url.search !== "")
		{
			url.search = url.search
			.replace(EMPTY_QUERY_VALUE, "$1&")
			.replace(TRAILING_EQUALS, "$1");
		}
		else if (TRAILING_QUESTION.test(url.href))
		{
			// Force `href` to update
			url.search = "";
		}
	}

	if (url.search!=="" && defaultValue(options, "plusQueries", url))
	{
		// @todo https://github.com/whatwg/url/issues/18
		url.search = url.search.replace(ENCODED_SPACE, "+");
	}

	if (defaultValue(options, "removeWWW", url))
	{
		// @todo "www.www.domain.com" doesn't get stripped correctly
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
};



minURL.CAREFUL_PROFILE = CAREFUL_PROFILE;
minURL.COMMON_PROFILE = COMMON_PROFILE;



module.exports = deepFreeze(minURL);
