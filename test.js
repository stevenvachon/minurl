"use strict";
const {before, describe, it} = require("mocha");
const customizeURL = require("incomplete-url");
const {expect} = require("chai");
const minURL = require("./");
const {URL, URLSearchParams} = require("universal-url");



const httpOnly = url => url.protocol==="http:" || url.protocol==="https:";



const options = overrides => Object.assign
(
	{
		clone: false,
		defaultPorts: {},
		directoryIndexes: [],
		plusQueries: false,
		queryNames: [],
		removeDefaultPort: false,
		removeEmptyDirectoryNames: false,
		removeDirectoryIndex: false,
		removeEmptyHash: false,
		removeEmptyQueries: false,
		removeEmptyQueryNames: false,
		removeEmptyQueryValues: false,
		removeHash: false,
		removeQueryNames: false,
		removeQueryOddities: false,
		removeRootTrailingSlash: false,
		removeTrailingSlash: false,
		removeWWW: false,
		sortQueries: false,
		stringify: true  // special
	},
	overrides
);



it(`has "careful" options profile publicly available`, function()
{
	expect( minURL.CAREFUL_PROFILE ).to.be.an("object");

	const originalValue = minURL.CAREFUL_PROFILE;

	expect(() => minURL.CAREFUL_PROFILE = "changed").to.throw(Error);
	expect(() => minURL.CAREFUL_PROFILE.defaultPorts = "changed").to.throw(Error);
	expect(minURL.CAREFUL_PROFILE).to.equal(originalValue);
});



it(`has "common" options profile publicly available`, function()
{
	expect( minURL.COMMON_PROFILE ).to.be.an("object");

	const originalValue = minURL.COMMON_PROFILE;

	expect(() => minURL.COMMON_PROFILE = "changed").to.throw(Error);
	expect(() => minURL.COMMON_PROFILE.defaultPorts = "changed").to.throw(Error);
	expect(minURL.COMMON_PROFILE).to.equal(originalValue);
});



it("accepts URL input", function()
{
	const opts = options();
	const url1 = new URL("http://www.domain.com:123/dir/file.html?qu ery#hash");
	const url2 =         "http://www.domain.com:123/dir/file.html?qu%20ery#hash";
	expect( minURL(url1,opts) ).to.equal(url2);
});



it("rejects non-URL input", function()
{
	const opts = options();
	const url = "http://www.domain.com:123/dir/file.html?query#hash";
	expect(() => minURL(url, opts)).to.throw(TypeError);
});



describe("options", function()
{
	// NOTE :: `options.clone` is tested further down



	it("plusQueries = false", function()
	{
		const opts = options();
		const url1 = "http://www.domain.com:123/?va%20+r1=%20+dir&var2=text#hash";
		const url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("plusQueries = true", function()
	{
		const opts = options({ plusQueries:true });
		let url1,url2;

		url1 = new URL("http://www.domain.com:123/dir%20name/file.html?va%20r1=%20+dir&var2=text#hash");
		url2 =         "http://www.domain.com:123/dir%20name/file.html?va+r1=++dir&var2=text#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "http://www.domain.com:123/dir%20name/file.html#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = new URL("other://www.domain.com:123/dir%20name/file.html?va%20r1=%20+dir&var2=text#hash");
		url2 =         "other://www.domain.com:123/dir%20name/file.html?va+r1=++dir&var2=text#hash";
		expect( minURL(url1,opts) ).to.equal(url2);
	});



	it("plusQueries = function", function()
	{
		const opts = options({ plusQueries:httpOnly });
		let url1,url2;

		url1 = new URL("http://www.domain.com:123/dir%20name/file.html?va%20r1=%20+dir&var2=text#hash");
		url2 =         "http://www.domain.com:123/dir%20name/file.html?va+r1=++dir&var2=text#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "http://www.domain.com:123/dir%20name/file.html#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "other://www.domain.com:123/dir%20name/file.html?va%20r1=%20+dir&var2=text#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeDefaultPort = false", function()
	{
		const opts = options({ defaultPorts:{ "http:":1234 } });
		const url1 = "http://www.domain.com:1234/dir/file.html?query#hash";
		const url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeDefaultPort = true", function()
	{
		const opts = options({ removeDefaultPort:true, defaultPorts:{ "http:":1234 } });
		let url1,url2;

		url1 = new URL("http://www.domain.com:1234/dir/file.html?query#hash");
		url2 =         "http://www.domain.com/dir/file.html?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "http://www.domain.com:123/dir/file.html?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "other://www.domain.com:1234/dir/file.html?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeDefaultPort = function", function()
	{
		const opts = options({ removeDefaultPort:httpOnly, defaultPorts:{ "http:":1234, "other:":1234 } });
		let url1,url2;

		url1 = new URL("http://www.domain.com:1234/dir/file.html?query#hash");
		url2 =         "http://www.domain.com/dir/file.html?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "http://www.domain.com:123/dir/file.html?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "other://www.domain.com:1234/dir/file.html?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeDirectoryIndex = false", function()
	{
		const opts = options({ directoryIndexes:["other.html"] });
		const url1 = "http://www.domain.com:123/dir/other.html?query#hash";
		const url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeDirectoryIndex = true", function()
	{
		let opts = options({ removeDirectoryIndex:true, directoryIndexes:["other.html"] });
		let url1,url2;

		url1 = new URL("http://www.domain.com:123/other.html");
		url2 =         "http://www.domain.com:123/";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = new URL("http://www.domain.com:123/dir/other.html?query#hash");
		url2 =         "http://www.domain.com:123/dir/?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "http://www.domain.com:123/another.html";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "http://www.domain.com:123/dir/another.html?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = new URL("other://www.domain.com:123/other.html?query#hash");
		url2 =         "other://www.domain.com:123/?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		opts = options({ removeDirectoryIndex:true, directoryIndexes:[/^another\.[a-z]+$/] });
		url1 = new URL("http://www.domain.com:123/another.html");
		url2 =         "http://www.domain.com:123/";
		expect( minURL(url1,opts) ).to.equal(url2);
	});



	it("removeDirectoryIndex = function", function()
	{
		const opts = options({ removeDirectoryIndex:httpOnly, directoryIndexes:["other.html"] });
		let url1,url2;

		url1 = new URL("http://www.domain.com:123/other.html?query#hash");
		url2 =         "http://www.domain.com:123/?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "other://www.domain.com:123/other.html?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeEmptyDirectoryNames = false", function()
	{
		const opts = options();
		const url1 = "http://www.domain.com:123/dir//file.html?query#hash";
		const url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeEmptyDirectoryNames = true", function()
	{
		const opts = options({ removeEmptyDirectoryNames:true });
		let url1,url2;

		url1 = new URL("http://www.domain.com:123/dir//file.html?query#hash");
		url2 =         "http://www.domain.com:123/dir/file.html?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = new URL("http://www.domain.com:123/dir///file.html?query#hash");
		url2 =         "http://www.domain.com:123/dir/file.html?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = new URL("other://www.domain.com:123/dir//file.html?query#hash");
		url2 =         "other://www.domain.com:123/dir/file.html?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);
	});



	it("removeEmptyDirectoryNames = function", function()
	{
		const opts = options({ removeEmptyDirectoryNames:httpOnly });
		let url1,url2;

		url1 = new URL("http://www.domain.com:123/dir//file.html?query#hash");
		url2 =         "http://www.domain.com:123/dir/file.html?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = new URL("http://www.domain.com:123/dir///file.html?query#hash");
		url2 =         "http://www.domain.com:123/dir/file.html?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "other://www.domain.com:123/dir//file.html?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeEmptyHash = false", function()
	{
		const opts = options();
		const url1 = "http://www.domain.com:123/dir/file.html?query#";
		const url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeEmptyHash = true", function()
	{
		const opts = options({ removeEmptyHash:true });
		let url1,url2;

		url1 = new URL("http://www.domain.com:123/dir/file.html?query#");
		url2 =         "http://www.domain.com:123/dir/file.html?query";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "http://www.domain.com:123/dir/file.html?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "http://www.domain.com:123/dir/file.html?query";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = new URL("other://www.domain.com:123/dir/file.html?query#");
		url2 =         "other://www.domain.com:123/dir/file.html?query";
		expect( minURL(url1,opts) ).to.equal(url2);
	});



	it("removeEmptyHash = function", function()
	{
		const opts = options({ removeEmptyHash:httpOnly });
		let url1,url2;

		url1 = new URL("http://www.domain.com:123/dir/file.html?query#");
		url2 =         "http://www.domain.com:123/dir/file.html?query";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "other://www.domain.com:123/dir/file.html?query#";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeEmptyQueries = false", function()
	{
		const opts = options();
		const url1 = "http://www.domain.com:123/dir/file.html?=#hash";
		const url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeEmptyQueries = true", function()
	{
		const opts = options({ removeEmptyQueries:true });
		let url1,url2;

		url1 = "http://www.domain.com:123/dir/file.html?var=#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "http://www.domain.com:123/dir/file.html?=value#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = new URL("http://www.domain.com:123/dir/file.html?=#hash");
		url2 =         "http://www.domain.com:123/dir/file.html#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "http://www.domain.com:123/dir/file.html?var1=value&var2=#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "http://www.domain.com:123/dir/file.html?var1=value&=value#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = new URL("http://www.domain.com:123/dir/file.html?var1=value&=#hash");
		url2 =         "http://www.domain.com:123/dir/file.html?var1=value#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "http://www.domain.com:123/dir/file.html?var=&var=value&var=#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = new URL("http://www.domain.com:123/dir/file.html?var=&=value&=#hash");
		url2 =         "http://www.domain.com:123/dir/file.html?var=&=value#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = new URL("other://www.domain.com:123/dir/file.html?var=&=value&=#hash");
		url2 =         "other://www.domain.com:123/dir/file.html?var=&=value#hash";
		expect( minURL(url1,opts) ).to.equal(url2);
	});



	it("removeEmptyQueries = function", function()
	{
		const opts = options({ removeEmptyQueries:httpOnly });
		let url1,url2;

		url1 = new URL("http://www.domain.com:123/dir/file.html?=&=#hash");
		url2 =         "http://www.domain.com:123/dir/file.html#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "other://www.domain.com:123/dir/file.html?=&=#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeEmptyQueryNames = false", function()
	{
		const opts = options();
		const url1 = "http://www.domain.com:123/dir/file.html?=value#hash";
		const url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeEmptyQueryNames = true", function()
	{
		const opts = options({ removeEmptyQueryNames:true });
		let url1,url2;

		url1 = "http://www.domain.com:123/dir/file.html?var=#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = new URL("http://www.domain.com:123/dir/file.html?=value#hash");
		url2 =         "http://www.domain.com:123/dir/file.html#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "http://www.domain.com:123/dir/file.html?=#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "http://www.domain.com:123/dir/file.html?var1=value&var2=#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = new URL("http://www.domain.com:123/dir/file.html?var1=value&=value#hash");
		url2 =         "http://www.domain.com:123/dir/file.html?var1=value#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "http://www.domain.com:123/dir/file.html?var1=value&=#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "http://www.domain.com:123/dir/file.html?var=&var=value&var=#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = new URL("http://www.domain.com:123/dir/file.html?var=&=value&=#hash");
		url2 =         "http://www.domain.com:123/dir/file.html?var=&=#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = new URL("other://www.domain.com:123/dir/file.html?var=&=value&=#hash");
		url2 =         "other://www.domain.com:123/dir/file.html?var=&=#hash";
		expect( minURL(url1,opts) ).to.equal(url2);
	});



	it("removeEmptyQueryNames = function", function()
	{
		const opts = options({ removeEmptyQueryNames:httpOnly });
		let url1,url2;

		url1 = new URL("http://www.domain.com:123/dir/file.html?=value#hash");
		url2 =         "http://www.domain.com:123/dir/file.html#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "other://www.domain.com:123/dir/file.html?=value#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeEmptyQueryValues = false", function()
	{
		const opts = options();
		const url1 = "http://www.domain.com:123/dir/file.html?var=#hash";
		const url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeEmptyQueryValues = true", function()
	{
		const opts = options({ removeEmptyQueryValues:true });
		let url1,url2;

		url1 = new URL("http://www.domain.com:123/dir/file.html?var=#hash");
		url2 =         "http://www.domain.com:123/dir/file.html#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "http://www.domain.com:123/dir/file.html?=value#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "http://www.domain.com:123/dir/file.html?=#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = new URL("http://www.domain.com:123/dir/file.html?var1=value&var2=#hash");
		url2 =         "http://www.domain.com:123/dir/file.html?var1=value#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "http://www.domain.com:123/dir/file.html?var1=value&=value#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "http://www.domain.com:123/dir/file.html?var1=value&=#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = new URL("http://www.domain.com:123/dir/file.html?var=&var=value&var=#hash");
		url2 =         "http://www.domain.com:123/dir/file.html?var=value#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = new URL("http://www.domain.com:123/dir/file.html?var=&=value&=#hash");
		url2 =         "http://www.domain.com:123/dir/file.html?=value&=#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = new URL("other://www.domain.com:123/dir/file.html?var=&=value&=#hash");
		url2 =         "other://www.domain.com:123/dir/file.html?=value&=#hash";
		expect( minURL(url1,opts) ).to.equal(url2);
	});



	it("removeEmptyQueryValues = function", function()
	{
		const opts = options({ removeEmptyQueryValues:httpOnly });
		let url1,url2;

		url1 = new URL("http://www.domain.com:123/dir/file.html?var=#hash");
		url2 =         "http://www.domain.com:123/dir/file.html#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "other://www.domain.com:123/dir/file.html?var=#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeHash = false", function()
	{
		const opts = options();
		const url1 = "http://www.domain.com:123/dir/file.html?query#hash";
		const url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeHash = true", function()
	{
		const opts = options({ removeHash:true });
		let url1,url2;

		url1 = new URL("http://www.domain.com:123/dir/file.html?query#hash");
		url2 =         "http://www.domain.com:123/dir/file.html?query";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = new URL("http://www.domain.com:123/dir/file.html?query#");
		url2 =         "http://www.domain.com:123/dir/file.html?query";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "http://www.domain.com:123/dir/file.html?query";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = new URL("other://www.domain.com:123/dir/file.html?query#hash");
		url2 =         "other://www.domain.com:123/dir/file.html?query";
		expect( minURL(url1,opts) ).to.equal(url2);
	});



	it("removeHash = function", function()
	{
		const opts = options({ removeHash:httpOnly });
		let url1,url2;

		url1 = new URL("http://www.domain.com:123/dir/file.html?query#hash");
		url2 =         "http://www.domain.com:123/dir/file.html?query";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "other://www.domain.com:123/dir/file.html?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeQueryNames = false", function()
	{
		const opts = options({ queryNames:["query"] });
		const url1 = "http://www.domain.com:123/dir/file.html?query=value#hash";
		const url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeQueryNames = true", function()
	{
		let opts,url1,url2;

		opts = options({ queryNames:["var1"], removeQueryNames:true });
		url1 = new URL("http://www.domain.com:123/dir/file.html?var1=value1&var1=value2&var2=value#hash");
		url2 =         "http://www.domain.com:123/dir/file.html?var2=value#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		opts = options({ queryNames:[/^var\d+$/], removeQueryNames:true });
		url1 = new URL("http://www.domain.com:123/dir/file.html?var1=value1&var1=value2&var2=value&var=value#hash");
		url2 =         "http://www.domain.com:123/dir/file.html?var=value#hash";
		expect( minURL(url1,opts) ).to.equal(url2);
	});



	it("removeQueryNames = function", function()
	{
		const opts = options({ queryNames:["var1"], removeQueryNames:httpOnly });
		let url1,url2;

		url1 = new URL("http://www.domain.com:123/dir/file.html?var1=value&var2=value#hash");
		url2 =         "http://www.domain.com:123/dir/file.html?var2=value#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "other://www.domain.com:123/dir/file.html?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeQueryOddities = false", function()
	{
		const opts = options();
		const url1 = "http://domain.com/?";
		const url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeQueryOddities = true", function()
	{
		const opts = options({ removeQueryOddities:true });
		let url1,url2;

		url1 = new URL("http://domain.com/?");
		url2 =         "http://domain.com/";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = new URL("http://domain.com/?#hash");
		url2 =         "http://domain.com/#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = new URL("http://domain.com/?#");
		url2 =         "http://domain.com/#";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = new URL("http://domain.com/?var=");
		url2 =         "http://domain.com/?var";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = new URL("http://domain.com/?var1=&var2=");
		url2 =         "http://domain.com/?var1&var2";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "http://domain.com/?var&";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "http://domain.com/?var&&";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "http://domain.com/?=";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "http://domain.com/?var&=";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "http://domain.com/??var";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "http://domain.com/?var==value";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "http://domain.com/";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeQueryOddities = function", function()
	{
		const opts = options({ removeQueryOddities:httpOnly });
		let url1,url2;

		url1 = new URL("http://domain.com/?");
		url2 =         "http://domain.com/";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "other://domain.com/?";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeRootTrailingSlash = false", function()
	{
		const opts = options();
		const url1 = "http://www.domain.com:123/";
		const url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeRootTrailingSlash = true", function()
	{
		const opts = options({ removeRootTrailingSlash:true });
		let url1,url2;

		url1 = new URL("http://www.domain.com:123/");
		url2 =         "http://www.domain.com:123";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "http://www.domain.com:123//";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = new URL("http://www.domain.com:123/?query#hash");
		url2 =         "http://www.domain.com:123?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "http://www.domain.com:123/file.html?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "http://www.domain.com:123/dir/?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "http://www.domain.com:123/dir/file.html?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "http://www.domain.com:123//?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "http://www.domain.com/www.domain.com/?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "http://www.ᄯᄯᄯ.ExAmPlE/?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal("http://www.xn--brdaa.example?query#hash");

		url1 = new URL("other://www.domain.com:123/?query#hash");
		url2 =         "other://www.domain.com:123?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = new URL("file:\\\\\\C:\\");
		url2 =         "file:///C:/";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "file:///C:/dir/?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "file:///C:/dir1/dir2/?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "file:///dir/?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "file:///dir1/dir2/?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = new URL("file:///");
		url2 =         "file://";
		expect( minURL(url1,opts) ).to.equal(url2);
	});



	it("removeRootTrailingSlash = function", function()
	{
		const opts = options({ removeRootTrailingSlash:httpOnly });
		let url1,url2;

		url1 = new URL("http://www.domain.com:123/?query#hash");
		url2 =         "http://www.domain.com:123?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "other://www.domain.com:123/?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeTrailingSlash = false", function()
	{
		const opts = options();
		const url1 = "http://www.domain.com:123/";
		const url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeTrailingSlash = true", function()
	{
		const opts = options({ removeTrailingSlash:true });
		let url1,url2;

		url1 = new URL("http://www.domain.com:123/");
		url2 =         "http://www.domain.com:123";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "http://www.domain.com:123//";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = new URL("http://www.domain.com:123/?query#hash");
		url2 =         "http://www.domain.com:123?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "http://www.domain.com:123/file.html?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = new URL("http://www.domain.com:123/dir/?query#hash");
		url2 =         "http://www.domain.com:123/dir?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "http://www.domain.com:123/dir/file.html?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "http://www.domain.com:123/dir//?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = new URL("http://www.domain.com/www.domain.com/?query#hash");
		url2 =         "http://www.domain.com/www.domain.com?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "http://www.ᄯᄯᄯ.ExAmPlE/?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal("http://www.xn--brdaa.example?query#hash");

		url1 = new URL("other://www.domain.com:123/dir/?query#hash");
		url2 =         "other://www.domain.com:123/dir?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = new URL("file:\\\\\\C:\\");
		url2 =         "file:///C:";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = new URL("file:///C:/dir/?query#hash");
		url2 =         "file:///C:/dir?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = new URL("file:///C:/dir1/dir2/?query#hash");
		url2 =         "file:///C:/dir1/dir2?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = new URL("file:///dir/?query#hash");
		url2 =         "file:///dir?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = new URL("file:///dir1/dir2/?query#hash");
		url2 =         "file:///dir1/dir2?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = new URL("file:///");
		url2 =         "file://";
		expect( minURL(url1,opts) ).to.equal(url2);
	});



	it("removeTrailingSlash = function", function()
	{
		const opts = options({ removeTrailingSlash:httpOnly });
		let url1,url2;

		url1 = new URL("http://www.domain.com/dir/?query#hash");
		url2 =         "http://www.domain.com/dir?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "other://www.domain.com/dir/?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeWWW = false", function()
	{
		const opts = options();
		const url1 = "http://www.domain.com:123/dir/file.html?query#hash";
		const url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeWWW = true", function()
	{
		const opts = options({ removeWWW:true });
		let url1,url2;

		url1 = new URL("http://www.domain.com:123/dir/file.html?query#hash");
		url2 =         "http://domain.com:123/dir/file.html?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "http://www.domain:123/dir/file.html?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "http://www.ᄯᄯᄯ.ExAmPlE:123/dir/file.html?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal("http://xn--brdaa.example:123/dir/file.html?query#hash");

		url1 = "http://www2.domain.com:123/dir/file.html?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "file:///www.domain.com/";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = new URL("other://www.domain.com:123/dir/file.html?query#hash");
		url2 =         "other://domain.com:123/dir/file.html?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);
	});



	it("removeWWW = function", function()
	{
		const opts = options({ removeWWW:httpOnly });
		let url1,url2;

		url1 = new URL("http://www.domain.com:123/dir/file.html?query#hash");
		url2 =         "http://domain.com:123/dir/file.html?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "http://www.domain:123/dir/file.html?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "other://www.domain.com:123/dir/file.html?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("sortQueries = false", function()
	{
		const opts = options();
		const url1 = "http://www.domain.com:123/dir/file.html?var1=value1&var2=value&var1=value2#hash";
		const url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("sortQueries = true", function()
	{
		const opts = options({ sortQueries:true });
		const url1 = new URL("http://www.domain.com:123/dir/file.html?var1=value1&var2=value&var1=value2#hash");
		const url2 =         "http://www.domain.com:123/dir/file.html?var1=value1&var1=value2&var2=value#hash";
		expect( minURL(url1,opts) ).to.equal(url2);
	});



	it("sortQueries = function", function()
	{
		const opts = options({ sortQueries:httpOnly });
		let url1,url2;

		url1 = new URL("http://www.domain.com:123/dir/file.html?var1=value1&var2=value&var1=value2#hash");
		url2 =         "http://www.domain.com:123/dir/file.html?var1=value1&var1=value2&var2=value#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "other://www.domain.com:123/dir/file.html?var1=value1&var2=value&var1=value2#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("stringify = false", function()
	{
		const opts = options({ removeRootTrailingSlash:true, removeTrailingSlash:true, stringify:false });
		let url1,url2;

		url1 = new URL("http://www.domain.com:123/");
		url2 = minURL(new URL(url1), opts);
		expect(url2).to.be.an.instanceOf(URL);
		expect(url2).to.deep.equal(url1);

		url1 = new URL("http://www.domain.com:123/dir/");
		url2 = minURL(new URL(url1), opts);
		expect(url2).to.be.an.instanceOf(URL);
		expect(url2).to.deep.equal(url1);
	});



	it("stringify = true", function()
	{
		const opts = options({ removeRootTrailingSlash:true, removeTrailingSlash:true });
		let url1,url2;

		url1 = new URL("http://www.domain.com:123/");
		url2 =         "http://www.domain.com:123";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = new URL("http://www.domain.com:123/dir/");
		url2 =         "http://www.domain.com:123/dir";
		expect( minURL(url1,opts) ).to.equal(url2);
	});



	it("clone = false, removeWWW = true, stringify = false", function()
	{
		const opts = options({ removeWWW:true, stringify:false });
		const url = new URL("http://www.domain.com/");
		const result = minURL(url, opts);

		expect(result).to.equal(url);
		expect(result.href).to.equal("http://domain.com/");
	});



	it("clone = true, removeWWW = true, stringify = false", function()
	{
		const opts = options({ clone:true, removeWWW:true, stringify:false });
		const url = new URL("http://www.domain.com/");
		const result = minURL(url, opts);

		expect(result).to.not.equal(url);
		expect(result.href).to.equal("http://domain.com/");
	});



	describe("in careful profile", function()
	{
		it("works", function()
		{
			const opts = minURL.CAREFUL_PROFILE;
			let url1,url2;

			// plusQueries
			// removeDefaultPort
			// ~~removeDirectoryIndex~~
			// removeEmptyHash
			// ~~removeEmptyQueries~~
			// removeQueryOddities
			// removeRootTrailingSlash
			// ~~removeTrailingSlash~~
			// ~~removeWWW~~
			// ~~sortQueries~~
			url1 = new URL("http://www.domain.com:80/?va%20r2=%20dir&var1=text&var3=#");
			url2 =         "http://www.domain.com?va+r2=+dir&var1=text&var3";
			expect( minURL(url1,opts) ).to.equal(url2);

			url1 = new URL("https://www.domain.com:443/?va%20r2=%20dir&var1=text&var3=#");
			url2 =         "https://www.domain.com?va+r2=+dir&var1=text&var3";
			expect( minURL(url1,opts) ).to.equal(url2);

			// plusQueries
			// removeDefaultPort
			// ~~removeDirectoryIndex~~
			// removeEmptyHash
			// ~~removeEmptyQueries~~
			// removeQueryOddities
			// ~~removeRootTrailingSlash~~
			// ~~removeTrailingSlash~~
			// ~~removeWWW~~
			// ~~sortQueries~~
			url1 = new URL("http://www.domain.com:80/dir/?va%20r2=%20dir&var1=text&var3=#");
			url2 =         "http://www.domain.com/dir/?va+r2=+dir&var1=text&var3";
			expect( minURL(url1,opts) ).to.equal(url2);

			url1 = new URL("https://www.domain.com:443/dir/?va%20r2=%20dir&var1=text&var3=#");
			url2 =         "https://www.domain.com/dir/?va+r2=+dir&var1=text&var3";
			expect( minURL(url1,opts) ).to.equal(url2);

			// plusQueries
			// removeDefaultPort
			// ~~removeDirectoryIndex~~
			// removeEmptyHash
			// ~~removeEmptyQueries~~
			// removeQueryOddities
			// ~~removeRootTrailingSlash~~
			// ~~removeTrailingSlash~~
			// ~~removeWWW~~
			// ~~sortQueries~~
			url1 = new URL("http://www.domain.com:80/dir/index.html?va%20r2=%20dir&var1=text&var3=#");
			url2 =         "http://www.domain.com/dir/index.html?va+r2=+dir&var1=text&var3";
			expect( minURL(url1,opts) ).to.equal(url2);

			url1 = new URL("https://www.domain.com:443/dir/index.html?va%20r2=%20dir&var1=text&var3=#");
			url2 =         "https://www.domain.com/dir/index.html?va+r2=+dir&var1=text&var3";
			expect( minURL(url1,opts) ).to.equal(url2);

			// plusQueries
			// removeDefaultPort
			// ~~removeDirectoryIndex~~
			// removeEmptyHash
			// ~~removeEmptyQueries~~
			// removeQueryOddities
			// ~~removeRootTrailingSlash~~
			// ~~removeTrailingSlash~~
			// ~~removeWWW~~
			// ~~sortQueries~~
			url1 = new URL("ftps://user@www.domain.com:990/dir/index.html?var2=hello%20world&var1=#");
			url2 =         "ftps://user@www.domain.com/dir/index.html?var2=hello+world&var1";
			expect( minURL(url1,opts) ).to.equal(url2);

			url1 = new URL("git://user@www.domain.com:9418/index.html?var2=hello%20world&var1=#");
			url2 =         "git://user@www.domain.com/index.html?var2=hello+world&var1";
			expect( minURL(url1,opts) ).to.equal(url2);

			url1 = new URL("scp://user@www.domain.com:22/dir/index.html?var2=hello%20world&var1=#");
			url2 =         "scp://user@www.domain.com/dir/index.html?var2=hello+world&var1";
			expect( minURL(url1,opts) ).to.equal(url2);

			url1 = new URL("sftp://user@www.domain.com:22/dir/index.html?var2=hello%20world&var1=#");
			url2 =         "sftp://user@www.domain.com/dir/index.html?var2=hello+world&var1";
			expect( minURL(url1,opts) ).to.equal(url2);

			url1 = new URL("ssh://user@www.domain.com:22/dir/index.html?var2=hello%20world&var1=#");
			url2 =         "ssh://user@www.domain.com/dir/index.html?var2=hello+world&var1";
			expect( minURL(url1,opts) ).to.equal(url2);

			// plusQueries
			// ~~removeDefaultPort~~
			// ~~removeDirectoryIndex~~
			// removeEmptyHash
			// removeEmptyQueries
			// removeQueryOddities
			// ~~removeRootTrailingSlash~~
			// ~~removeTrailingSlash~~
			// ~~removeWWW~~
			// sortQueries
			url1 = new URL("mailto:email@www.domain.com:123?subject=hello%20world&cc=user@domain.com&body=&#");
			url2 =         "mailto:email@www.domain.com:123?cc=user%40domain.com&subject=hello+world";
			expect( minURL(url1,opts) ).to.equal(url2);

			// ~~plusQueries~~
			// ~~removeDefaultPort~~
			// ~~removeDirectoryIndex~~
			// ~~removeEmptyHash~~
			// ~~removeEmptyQueries~~
			// removeQueryOddities
			// removeRootTrailingSlash
			// ~~removeTrailingSlash~~
			// ~~removeWWW~~
			// ~~sortQueries~~
			url1 = new URL("other://www.domain.com:123/?");
			url2 =         "other://www.domain.com:123";
			expect( minURL(url1,opts) ).to.equal(url2);
		});
	});



	function commonProfileTests(opts)
	{
		it("works", function()
		{
			let url1,url2;

			// plusQueries
			// removeDefaultPort
			// removeDirectoryIndex
			// removeEmptyHash
			// ~~removeEmptyQueries~~
			// removeQueryOddities
			// removeRootTrailingSlash
			// ~~removeTrailingSlash~~
			// removeWWW
			// ~~sortQueries~~
			url1 = new URL("http://www.domain.com:80/index.html?va%20r2=%20dir&var1=text&var3=#");
			url2 =         "http://domain.com?va+r2=+dir&var1=text&var3";
			expect( minURL(url1,opts) ).to.equal(url2);

			url1 = new URL("https://www.domain.com:443/index.html?va%20r2=%20dir&var1=text&var3=#");
			url2 =         "https://domain.com?va+r2=+dir&var1=text&var3";
			expect( minURL(url1,opts) ).to.equal(url2);

			// plusQueries
			// removeDefaultPort
			// removeDirectoryIndex
			// removeEmptyHash
			// ~~removeEmptyQueries~~
			// removeQueryOddities
			// ~~removeRootTrailingSlash~~
			// ~~removeTrailingSlash~~
			// removeWWW
			// ~~sortQueries~~
			url1 = new URL("http://www.domain.com:80/dir/index.html?va%20r2=%20dir&var1=text&var3=#");
			url2 =         "http://domain.com/dir/?va+r2=+dir&var1=text&var3";
			expect( minURL(url1,opts) ).to.equal(url2);

			url1 = new URL("https://www.domain.com:443/dir/index.html?va%20r2=%20dir&var1=text&var3=#");
			url2 =         "https://domain.com/dir/?va+r2=+dir&var1=text&var3";
			expect( minURL(url1,opts) ).to.equal(url2);

			// plusQueries
			// removeDefaultPort
			// ~~removeDirectoryIndex~~
			// removeEmptyHash
			// ~~removeEmptyQueries~~
			// removeQueryOddities
			// ~~removeRootTrailingSlash~~
			// ~~removeTrailingSlash~~
			// ~~removeWWW~~
			// ~~sortQueries~~
			url1 = new URL("ftps://user@www.domain.com:990/dir/index.html?var2=hello%20world&var1=#");
			url2 =         "ftps://user@www.domain.com/dir/index.html?var2=hello+world&var1";
			expect( minURL(url1,opts) ).to.equal(url2);

			url1 = new URL("git://user@www.domain.com:9418/index.html?var2=hello%20world&var1=#");
			url2 =         "git://user@www.domain.com/index.html?var2=hello+world&var1";
			expect( minURL(url1,opts) ).to.equal(url2);

			url1 = new URL("scp://user@www.domain.com:22/dir/index.html?var2=hello%20world&var1=#");
			url2 =         "scp://user@www.domain.com/dir/index.html?var2=hello+world&var1";
			expect( minURL(url1,opts) ).to.equal(url2);

			url1 = new URL("sftp://user@www.domain.com:22/dir/index.html?var2=hello%20world&var1=#");
			url2 =         "sftp://user@www.domain.com/dir/index.html?var2=hello+world&var1";
			expect( minURL(url1,opts) ).to.equal(url2);

			url1 = new URL("ssh://user@www.domain.com:22/dir/index.html?var2=hello%20world&var1=#");
			url2 =         "ssh://user@www.domain.com/dir/index.html?var2=hello+world&var1";
			expect( minURL(url1,opts) ).to.equal(url2);

			// plusQueries
			// ~~removeDefaultPort~~
			// ~~removeDirectoryIndex~~
			// removeEmptyHash
			// removeEmptyQueries
			// removeQueryOddities
			// ~~removeRootTrailingSlash~~
			// ~~removeTrailingSlash~~
			// ~~removeWWW~~
			// sortQueries
			url1 = new URL("mailto:email@www.domain.com:123?subject=hello%20world&cc=user@domain.com&body=&#");
			url2 =         "mailto:email@www.domain.com:123?cc=user%40domain.com&subject=hello+world";
			expect( minURL(url1,opts) ).to.equal(url2);

			// ~~plusQueries~~
			// ~~removeDefaultPort~~
			// ~~removeDirectoryIndex~~
			// ~~removeEmptyHash~~
			// ~~removeEmptyQueries~~
			// removeQueryOddities
			// removeRootTrailingSlash
			// ~~removeTrailingSlash~~
			// ~~removeWWW~~
			// ~~sortQueries~~
			url1 = new URL("other://www.domain.com:123/?");
			url2 =         "other://www.domain.com:123";
			expect( minURL(url1,opts) ).to.equal(url2);
		});
	}



	describe("in common profile", function()
	{
		commonProfileTests(minURL.COMMON_PROFILE);



		describe("with URL implementations lacking searchParams", function()
		{
			const opts = { clone:false };  // avoids using Node's `URL` on >=7.x
			let IncompleteURL;

			before(() => IncompleteURL = customizeURL({ noSearchParams:true }).IncompleteURL);

			it("works", function()
			{
				// plusQueries
				// ~~removeDefaultPort~~
				// ~~removeDirectoryIndex~~
				// removeEmptyHash
				// removeEmptyQueries
				// removeQueryOddities
				// ~~removeRootTrailingSlash~~
				// ~~removeTrailingSlash~~
				// ~~removeWWW~~
				// sortQueries
				const url1 = new IncompleteURL("mailto:email@www.domain.com:123?subject=hello%20world&cc=user@domain.com&body=&#");
				const url2 =                   "mailto:email@www.domain.com:123?subject=hello+world&cc=user@domain.com&body&";
				expect( minURL(url1,opts) ).to.equal(url2);
			});
		});



		describe("with URL implementations lacking searchParams.sort", function()
		{
			// TODO :: remove these options?
			const opts = { clone:false };  // avoids using Node's `URL` on >=7.x
			let IncompleteURL;

			before(() => IncompleteURL = customizeURL({ noSort:true }).IncompleteURL);

			it("works", function()
			{
				// plusQueries
				// ~~removeDefaultPort~~
				// ~~removeDirectoryIndex~~
				// removeEmptyHash
				// removeEmptyQueries
				// removeQueryOddities
				// ~~removeRootTrailingSlash~~
				// ~~removeTrailingSlash~~
				// ~~removeWWW~~
				// sortQueries
				const url1 = new IncompleteURL("mailto:email@www.domain.com:123?subject=hello%20world&cc=user@domain.com&body=&#");
				const url2 =                   "mailto:email@www.domain.com:123?subject=hello+world&cc=user%40domain.com";
				expect( minURL(url1,opts) ).to.equal(url2);
			});
		});
	});



	describe("in default profile", function()
	{
		commonProfileTests();
	});
});
