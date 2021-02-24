"use strict";
const {before, describe, it} = require("mocha");
const customizeURL = require("incomplete-url");
const {expect} = require("chai");
const minURL = require("./");



const httpOnly = url => url.protocol==="http:" || url.protocol==="https:";



const options = overrides =>
({
	clone: false,
	defaultPorts: {},
	indexFilenames: [],
	plusQueries: false,
	queryNames: [],
	removeAuth: false,
	removeDefaultPort: false,
	removeEmptyHash: false,
	removeEmptyQueries: false,
	removeEmptyQueryNames: false,
	removeEmptyQueryValues: false,
	removeEmptySegmentNames: false,
	removeHash: false,
	removeIndexFilename: false,
	removeQueryNames: false,
	removeQueryOddities: false,
	removeRootTrailingSlash: false,
	removeTrailingSlash: false,
	removeWWW: false,
	sortQueries: false,
	stringify: true,  // special
	...overrides
});



it(`has "careful" options profile publicly available`, () =>
{
	expect( minURL.CAREFUL_PROFILE ).to.be.an("object");

	const originalValue = minURL.CAREFUL_PROFILE;

	expect(() => minURL.CAREFUL_PROFILE.defaultPorts = "changed").to.throw(Error);
	expect(() => minURL.CAREFUL_PROFILE.nonExistent = "new").to.throw(Error);
	expect(minURL.CAREFUL_PROFILE).to.deep.equal(originalValue);

	expect(() => minURL.CAREFUL_PROFILE = "changed").to.throw(Error);
	expect(minURL.CAREFUL_PROFILE).to.equal(originalValue);
});



it(`has "common" options profile publicly available`, () =>
{
	expect( minURL.COMMON_PROFILE ).to.be.an("object");

	const originalValue = minURL.COMMON_PROFILE;

	expect(() => minURL.COMMON_PROFILE.defaultPorts = "changed").to.throw(Error);
	expect(() => minURL.COMMON_PROFILE.nonExistent = "new").to.throw(Error);
	expect(minURL.COMMON_PROFILE).to.deep.equal(originalValue);

	expect(() => minURL.COMMON_PROFILE = "changed").to.throw(Error);
	expect(minURL.COMMON_PROFILE).to.equal(originalValue);
});



it("accepts URL input", () =>
{
	const opts = options();
	const url1 = new URL("http://user:pass@www.domain.com:123/dir/file.html?qu ery#hash");
	const url2 =         "http://user:pass@www.domain.com:123/dir/file.html?qu%20ery#hash";
	expect( minURL(url1,opts) ).to.equal(url2);
});



it("rejects non-URL input", () =>
{
	const opts = options();
	const url = "http://user:pass@www.domain.com:123/dir/file.html?query#hash";
	expect(() => minURL(url, opts)).to.throw(TypeError);
});



describe("options", () =>
{
	// NOTE :: `options.clone` is tested further down



	it("plusQueries = false", () =>
	{
		const opts = options();
		const url1 = "http://user:pass@www.domain.com:123/?va%20+r1=%20+dir&var2=text#hash";
		const url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("plusQueries = true", () =>
	{
		const opts = options({ plusQueries:true });
		let url1,url2;

		url1 = new URL("http://user:pass@www.domain.com:123/dir%20name/file.html?va%20r1=%20+dir&var2=text#hash");
		url2 =         "http://user:pass@www.domain.com:123/dir%20name/file.html?va+r1=++dir&var2=text#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "http://user:pass@www.domain.com:123/dir%20name/file.html#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = new URL("other://user:pass@www.domain.com:123/dir%20name/file.html?va%20r1=%20+dir&var2=text#hash");
		url2 =         "other://user:pass@www.domain.com:123/dir%20name/file.html?va+r1=++dir&var2=text#hash";
		expect( minURL(url1,opts) ).to.equal(url2);
	});



	it("plusQueries = function", () =>
	{
		const opts = options({ plusQueries:httpOnly });
		let url1,url2;

		url1 = new URL("http://user:pass@www.domain.com:123/dir%20name/file.html?va%20r1=%20+dir&var2=text#hash");
		url2 =         "http://user:pass@www.domain.com:123/dir%20name/file.html?va+r1=++dir&var2=text#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "http://user:pass@www.domain.com:123/dir%20name/file.html#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "other://user:pass@www.domain.com:123/dir%20name/file.html?va%20r1=%20+dir&var2=text#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeAuth = false", () =>
	{
		const opts = options();
		const url1 = "http://user:pass@www.domain.com:123/dir/file.html?query#hash";
		const url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeAuth = true", () =>
	{
		const opts = options({ removeAuth:true });
		let url1,url2;

		url1 = new URL("http://user:pass@www.domain.com:123/dir/file.html?query#hash");
		url2 =         "http://www.domain.com:123/dir/file.html?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = new URL("other://user:pass@www.domain.com:123/dir/file.html?query#hash");
		url2 =         "other://www.domain.com:123/dir/file.html?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);
	});



	it("removeAuth = function", () =>
	{
		const opts = options({ removeAuth:httpOnly });
		let url1,url2;

		url1 = new URL("http://user:pass@www.domain.com:123/dir/file.html?query#hash");
		url2 =         "http://www.domain.com:123/dir/file.html?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "other://user:pass@www.domain.com:123/dir/file.html?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeDefaultPort = false", () =>
	{
		const opts = options({ defaultPorts:{ "http:":1234 } });
		const url1 = "http://user:pass@www.domain.com:1234/dir/file.html?query#hash";
		const url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeDefaultPort = true", () =>
	{
		const opts = options({ removeDefaultPort:true, defaultPorts:{ "http:":1234 } });
		let url1,url2;

		url1 = new URL("http://user:pass@www.domain.com:1234/dir/file.html?query#hash");
		url2 =         "http://user:pass@www.domain.com/dir/file.html?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "http://user:pass@www.domain.com:123/dir/file.html?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "other://user:pass@www.domain.com:1234/dir/file.html?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeDefaultPort = function", () =>
	{
		const opts = options({ removeDefaultPort:httpOnly, defaultPorts:{ "http:":1234, "other:":1234 } });
		let url1,url2;

		url1 = new URL("http://user:pass@www.domain.com:1234/dir/file.html?query#hash");
		url2 =         "http://user:pass@www.domain.com/dir/file.html?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "http://user:pass@www.domain.com:123/dir/file.html?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "other://user:pass@www.domain.com:1234/dir/file.html?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeEmptyHash = false", () =>
	{
		const opts = options();
		const url1 = "http://user:pass@www.domain.com:123/dir/file.html?query#";
		const url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeEmptyHash = true", () =>
	{
		const opts = options({ removeEmptyHash:true });
		let url1,url2;

		url1 = new URL("http://user:pass@www.domain.com:123/dir/file.html?query#");
		url2 =         "http://user:pass@www.domain.com:123/dir/file.html?query";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "http://user:pass@www.domain.com:123/dir/file.html?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "http://user:pass@www.domain.com:123/dir/file.html?query";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = new URL("other://user:pass@www.domain.com:123/dir/file.html?query#");
		url2 =         "other://user:pass@www.domain.com:123/dir/file.html?query";
		expect( minURL(url1,opts) ).to.equal(url2);
	});



	it("removeEmptyHash = function", () =>
	{
		const opts = options({ removeEmptyHash:httpOnly });
		let url1,url2;

		url1 = new URL("http://user:pass@www.domain.com:123/dir/file.html?query#");
		url2 =         "http://user:pass@www.domain.com:123/dir/file.html?query";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "other://user:pass@www.domain.com:123/dir/file.html?query#";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeEmptyQueries = false", () =>
	{
		const opts = options();
		const url1 = "http://user:pass@www.domain.com:123/dir/file.html?=#hash";
		const url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeEmptyQueries = true", () =>
	{
		const opts = options({ removeEmptyQueries:true });
		let url1,url2;

		url1 = "http://user:pass@www.domain.com:123/dir/file.html?var=#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "http://user:pass@www.domain.com:123/dir/file.html?=value#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = new URL("http://user:pass@www.domain.com:123/dir/file.html?=#hash");
		url2 =         "http://user:pass@www.domain.com:123/dir/file.html#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "http://user:pass@www.domain.com:123/dir/file.html?var1=value&var2=#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "http://user:pass@www.domain.com:123/dir/file.html?var1=value&=value#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = new URL("http://user:pass@www.domain.com:123/dir/file.html?var1=value&=#hash");
		url2 =         "http://user:pass@www.domain.com:123/dir/file.html?var1=value#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "http://user:pass@www.domain.com:123/dir/file.html?var=&var=value&var=#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = new URL("http://user:pass@www.domain.com:123/dir/file.html?var=&=value&=#hash");
		url2 =         "http://user:pass@www.domain.com:123/dir/file.html?var=&=value#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = new URL("other://user:pass@www.domain.com:123/dir/file.html?var=&=value&=#hash");
		url2 =         "other://user:pass@www.domain.com:123/dir/file.html?var=&=value#hash";
		expect( minURL(url1,opts) ).to.equal(url2);
	});



	it("removeEmptyQueries = function", () =>
	{
		const opts = options({ removeEmptyQueries:httpOnly });
		let url1,url2;

		url1 = new URL("http://user:pass@www.domain.com:123/dir/file.html?=&=#hash");
		url2 =         "http://user:pass@www.domain.com:123/dir/file.html#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "other://user:pass@www.domain.com:123/dir/file.html?=&=#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeEmptyQueryNames = false", () =>
	{
		const opts = options();
		const url1 = "http://user:pass@www.domain.com:123/dir/file.html?=value#hash";
		const url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeEmptyQueryNames = true", () =>
	{
		const opts = options({ removeEmptyQueryNames:true });
		let url1,url2;

		url1 = "http://user:pass@www.domain.com:123/dir/file.html?var=#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = new URL("http://user:pass@www.domain.com:123/dir/file.html?=value#hash");
		url2 =         "http://user:pass@www.domain.com:123/dir/file.html#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "http://user:pass@www.domain.com:123/dir/file.html?=#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "http://user:pass@www.domain.com:123/dir/file.html?var1=value&var2=#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = new URL("http://user:pass@www.domain.com:123/dir/file.html?var1=value&=value#hash");
		url2 =         "http://user:pass@www.domain.com:123/dir/file.html?var1=value#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "http://user:pass@www.domain.com:123/dir/file.html?var1=value&=#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "http://user:pass@www.domain.com:123/dir/file.html?var=&var=value&var=#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = new URL("http://user:pass@www.domain.com:123/dir/file.html?var=&=value&=#hash");
		url2 =         "http://user:pass@www.domain.com:123/dir/file.html?var=&=#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = new URL("other://user:pass@www.domain.com:123/dir/file.html?var=&=value&=#hash");
		url2 =         "other://user:pass@www.domain.com:123/dir/file.html?var=&=#hash";
		expect( minURL(url1,opts) ).to.equal(url2);
	});



	it("removeEmptyQueryNames = function", () =>
	{
		const opts = options({ removeEmptyQueryNames:httpOnly });
		let url1,url2;

		url1 = new URL("http://user:pass@www.domain.com:123/dir/file.html?=value#hash");
		url2 =         "http://user:pass@www.domain.com:123/dir/file.html#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "other://user:pass@www.domain.com:123/dir/file.html?=value#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeEmptyQueryValues = false", () =>
	{
		const opts = options();
		const url1 = "http://user:pass@www.domain.com:123/dir/file.html?var=#hash";
		const url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeEmptyQueryValues = true", () =>
	{
		const opts = options({ removeEmptyQueryValues:true });
		let url1,url2;

		url1 = new URL("http://user:pass@www.domain.com:123/dir/file.html?var=#hash");
		url2 =         "http://user:pass@www.domain.com:123/dir/file.html#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "http://user:pass@www.domain.com:123/dir/file.html?=value#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "http://user:pass@www.domain.com:123/dir/file.html?=#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = new URL("http://user:pass@www.domain.com:123/dir/file.html?var1=value&var2=#hash");
		url2 =         "http://user:pass@www.domain.com:123/dir/file.html?var1=value#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "http://user:pass@www.domain.com:123/dir/file.html?var1=value&=value#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "http://user:pass@www.domain.com:123/dir/file.html?var1=value&=#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = new URL("http://user:pass@www.domain.com:123/dir/file.html?var=&var=value&var=#hash");
		url2 =         "http://user:pass@www.domain.com:123/dir/file.html?var=value#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = new URL("http://user:pass@www.domain.com:123/dir/file.html?var=&=value&=#hash");
		url2 =         "http://user:pass@www.domain.com:123/dir/file.html?=value&=#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = new URL("other://user:pass@www.domain.com:123/dir/file.html?var=&=value&=#hash");
		url2 =         "other://user:pass@www.domain.com:123/dir/file.html?=value&=#hash";
		expect( minURL(url1,opts) ).to.equal(url2);
	});



	it("removeEmptyQueryValues = function", () =>
	{
		const opts = options({ removeEmptyQueryValues:httpOnly });
		let url1,url2;

		url1 = new URL("http://user:pass@www.domain.com:123/dir/file.html?var=#hash");
		url2 =         "http://user:pass@www.domain.com:123/dir/file.html#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "other://user:pass@www.domain.com:123/dir/file.html?var=#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeEmptySegmentNames = false", () =>
	{
		const opts = options();
		const url1 = "http://user:pass@www.domain.com:123/dir//file.html?query#hash";
		const url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeEmptySegmentNames = true", () =>
	{
		const opts = options({ removeEmptySegmentNames:true });
		let url1,url2;

		url1 = new URL("http://user:pass@www.domain.com:123/dir//file.html?query#hash");
		url2 =         "http://user:pass@www.domain.com:123/dir/file.html?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = new URL("http://user:pass@www.domain.com:123/dir///file.html?query#hash");
		url2 =         "http://user:pass@www.domain.com:123/dir/file.html?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = new URL("other://user:pass@www.domain.com:123/dir//file.html?query#hash");
		url2 =         "other://user:pass@www.domain.com:123/dir/file.html?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);
	});



	it("removeEmptySegmentNames = function", () =>
	{
		const opts = options({ removeEmptySegmentNames:httpOnly });
		let url1,url2;

		url1 = new URL("http://user:pass@www.domain.com:123/dir//file.html?query#hash");
		url2 =         "http://user:pass@www.domain.com:123/dir/file.html?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = new URL("http://user:pass@www.domain.com:123/dir///file.html?query#hash");
		url2 =         "http://user:pass@www.domain.com:123/dir/file.html?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "other://user:pass@www.domain.com:123/dir//file.html?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeHash = false", () =>
	{
		const opts = options();
		const url1 = "http://user:pass@www.domain.com:123/dir/file.html?query#hash";
		const url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeHash = true", () =>
	{
		const opts = options({ removeHash:true });
		let url1,url2;

		url1 = new URL("http://user:pass@www.domain.com:123/dir/file.html?query#hash");
		url2 =         "http://user:pass@www.domain.com:123/dir/file.html?query";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = new URL("http://user:pass@www.domain.com:123/dir/file.html?query#");
		url2 =         "http://user:pass@www.domain.com:123/dir/file.html?query";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "http://user:pass@www.domain.com:123/dir/file.html?query";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = new URL("other://user:pass@www.domain.com:123/dir/file.html?query#hash");
		url2 =         "other://user:pass@www.domain.com:123/dir/file.html?query";
		expect( minURL(url1,opts) ).to.equal(url2);
	});



	it("removeHash = function", () =>
	{
		const opts = options({ removeHash:httpOnly });
		let url1,url2;

		url1 = new URL("http://user:pass@www.domain.com:123/dir/file.html?query#hash");
		url2 =         "http://user:pass@www.domain.com:123/dir/file.html?query";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "other://user:pass@www.domain.com:123/dir/file.html?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeIndexFilename = false", () =>
	{
		const opts = options({ indexFilenames:["other.html"] });
		const url1 = "http://user:pass@www.domain.com:123/dir/other.html?query#hash";
		const url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeIndexFilename = true", () =>
	{
		let opts = options({ removeIndexFilename:true, indexFilenames:["other.html"] });
		let url1,url2;

		url1 = new URL("http://user:pass@www.domain.com:123/other.html");
		url2 =         "http://user:pass@www.domain.com:123/";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = new URL("http://user:pass@www.domain.com:123/dir/other.html?query#hash");
		url2 =         "http://user:pass@www.domain.com:123/dir/?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "http://user:pass@www.domain.com:123/another.html";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "http://user:pass@www.domain.com:123/dir/another.html?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = new URL("other://user:pass@www.domain.com:123/other.html?query#hash");
		url2 =         "other://user:pass@www.domain.com:123/?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		opts = options({ removeIndexFilename:true, indexFilenames:[/^another\.[a-z]+$/] });
		url1 = new URL("http://user:pass@www.domain.com:123/another.html");
		url2 =         "http://user:pass@www.domain.com:123/";
		expect( minURL(url1,opts) ).to.equal(url2);
	});



	it("removeIndexFilename = function", () =>
	{
		const opts = options({ removeIndexFilename:httpOnly, indexFilenames:["other.html"] });
		let url1,url2;

		url1 = new URL("http://user:pass@www.domain.com:123/other.html?query#hash");
		url2 =         "http://user:pass@www.domain.com:123/?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "other://user:pass@www.domain.com:123/other.html?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeQueryNames = false", () =>
	{
		const opts = options({ queryNames:["query"] });
		const url1 = "http://user:pass@www.domain.com:123/dir/file.html?query=value#hash";
		const url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeQueryNames = true", () =>
	{
		let opts,url1,url2;

		opts = options({ queryNames:["var1"], removeQueryNames:true });
		url1 = new URL("http://user:pass@www.domain.com:123/dir/file.html?var1=value1&var1=value2&var2=value#hash");
		url2 =         "http://user:pass@www.domain.com:123/dir/file.html?var2=value#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		opts = options({ queryNames:[/^var\d+$/], removeQueryNames:true });
		url1 = new URL("http://user:pass@www.domain.com:123/dir/file.html?var1=value1&var1=value2&var2=value&var=value#hash");
		url2 =         "http://user:pass@www.domain.com:123/dir/file.html?var=value#hash";
		expect( minURL(url1,opts) ).to.equal(url2);
	});



	it("removeQueryNames = function", () =>
	{
		const opts = options({ queryNames:["var1"], removeQueryNames:httpOnly });
		let url1,url2;

		url1 = new URL("http://user:pass@www.domain.com:123/dir/file.html?var1=value&var2=value#hash");
		url2 =         "http://user:pass@www.domain.com:123/dir/file.html?var2=value#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "other://user:pass@www.domain.com:123/dir/file.html?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeQueryOddities = false", () =>
	{
		const opts = options();
		const url1 = "http://user:pass@domain.com/?";
		const url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeQueryOddities = true", () =>
	{
		const opts = options({ removeQueryOddities:true });
		let url1,url2;

		url1 = new URL("http://user:pass@domain.com/?");
		url2 =         "http://user:pass@domain.com/";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = new URL("http://user:pass@domain.com/?#hash");
		url2 =         "http://user:pass@domain.com/#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = new URL("http://user:pass@domain.com/?#");
		url2 =         "http://user:pass@domain.com/#";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = new URL("http://user:pass@domain.com/?var=");
		url2 =         "http://user:pass@domain.com/?var";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = new URL("http://user:pass@domain.com/?var1=&var2=");
		url2 =         "http://user:pass@domain.com/?var1&var2";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "http://user:pass@domain.com/?var&";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "http://user:pass@domain.com/?var&&";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "http://user:pass@domain.com/?=";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "http://user:pass@domain.com/?var&=";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "http://user:pass@domain.com/??var";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "http://user:pass@domain.com/?var==value";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "http://user:pass@domain.com/";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeQueryOddities = function", () =>
	{
		const opts = options({ removeQueryOddities:httpOnly });
		let url1,url2;

		url1 = new URL("http://user:pass@domain.com/?");
		url2 =         "http://user:pass@domain.com/";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "other://user:pass@domain.com/?";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeRootTrailingSlash = false", () =>
	{
		const opts = options();
		const url1 = "http://user:pass@www.domain.com:123/";
		const url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeRootTrailingSlash = true", () =>
	{
		const opts = options({ removeRootTrailingSlash:true });
		let url1,url2;

		url1 = new URL("http://user:pass@www.domain.com:123/");
		url2 =         "http://user:pass@www.domain.com:123";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "http://user:pass@www.domain.com:123//";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = new URL("http://user:pass@www.domain.com:123/?query#hash");
		url2 =         "http://user:pass@www.domain.com:123?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "http://user:pass@www.domain.com:123/file.html?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "http://user:pass@www.domain.com:123/dir/?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "http://user:pass@www.domain.com:123/dir/file.html?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "http://user:pass@www.domain.com:123//?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "http://user:pass@www.domain.com/www.domain.com/?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "http://user:pass@www.ᄯᄯᄯ.ExAmPlE/?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal("http://user:pass@www.xn--brdaa.example?query#hash");

		url1 = new URL("other://user:pass@www.domain.com:123/?query#hash");
		url2 =         "other://user:pass@www.domain.com:123?query#hash";
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



	it("removeRootTrailingSlash = function", () =>
	{
		const opts = options({ removeRootTrailingSlash:httpOnly });
		let url1,url2;

		url1 = new URL("http://user:pass@www.domain.com:123/?query#hash");
		url2 =         "http://user:pass@www.domain.com:123?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "other://user:pass@www.domain.com:123/?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeTrailingSlash = false", () =>
	{
		const opts = options();
		const url1 = "http://user:pass@www.domain.com:123/";
		const url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeTrailingSlash = true", () =>
	{
		const opts = options({ removeTrailingSlash:true });
		let url1,url2;

		url1 = new URL("http://user:pass@www.domain.com:123/");
		url2 =         "http://user:pass@www.domain.com:123";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "http://user:pass@www.domain.com:123//";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = new URL("http://user:pass@www.domain.com:123/?query#hash");
		url2 =         "http://user:pass@www.domain.com:123?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "http://user:pass@www.domain.com:123/file.html?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = new URL("http://user:pass@www.domain.com:123/dir/?query#hash");
		url2 =         "http://user:pass@www.domain.com:123/dir?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "http://user:pass@www.domain.com:123/dir/file.html?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "http://user:pass@www.domain.com:123/dir//?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = new URL("http://user:pass@www.domain.com/www.domain.com/?query#hash");
		url2 =         "http://user:pass@www.domain.com/www.domain.com?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "http://user:pass@www.ᄯᄯᄯ.ExAmPlE/?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal("http://user:pass@www.xn--brdaa.example?query#hash");

		url1 = new URL("other://user:pass@www.domain.com:123/dir/?query#hash");
		url2 =         "other://user:pass@www.domain.com:123/dir?query#hash";
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



	it("removeTrailingSlash = function", () =>
	{
		const opts = options({ removeTrailingSlash:httpOnly });
		let url1,url2;

		url1 = new URL("http://user:pass@www.domain.com/dir/?query#hash");
		url2 =         "http://user:pass@www.domain.com/dir?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "other://user:pass@www.domain.com/dir/?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeWWW = false", () =>
	{
		const opts = options();
		const url1 = "http://user:pass@www.domain.com:123/dir/file.html?query#hash";
		const url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("removeWWW = true", () =>
	{
		const opts = options({ removeWWW:true });
		let url1,url2;

		url1 = new URL("http://user:pass@www.domain.com:123/dir/file.html?query#hash");
		url2 =         "http://user:pass@domain.com:123/dir/file.html?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "http://user:pass@www.domain:123/dir/file.html?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "http://user:pass@www.ᄯᄯᄯ.ExAmPlE.com:123/dir/file.html?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal("http://user:pass@xn--brdaa.example.com:123/dir/file.html?query#hash");

		url1 = "http://user:pass@www2.domain.com:123/dir/file.html?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "file:///www.domain.com/";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = new URL("other://user:pass@www.domain.com:123/dir/file.html?query#hash");
		url2 =         "other://user:pass@domain.com:123/dir/file.html?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);
	});



	it("removeWWW = function", () =>
	{
		const opts = options({ removeWWW:httpOnly });
		let url1,url2;

		url1 = new URL("http://user:pass@www.domain.com:123/dir/file.html?query#hash");
		url2 =         "http://user:pass@domain.com:123/dir/file.html?query#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "http://user:pass@www.domain:123/dir/file.html?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);

		url1 = "other://user:pass@www.domain.com:123/dir/file.html?query#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("sortQueries = false", () =>
	{
		const opts = options();
		const url1 = "http://user:pass@www.domain.com:123/dir/file.html?var1=value1&var2=value&var1=value2#hash";
		const url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("sortQueries = true", () =>
	{
		const opts = options({ sortQueries:true });
		const url1 = new URL("http://user:pass@www.domain.com:123/dir/file.html?var1=value1&var2=value&var1=value2#hash");
		const url2 =         "http://user:pass@www.domain.com:123/dir/file.html?var1=value1&var1=value2&var2=value#hash";
		expect( minURL(url1,opts) ).to.equal(url2);
	});



	it("sortQueries = function", () =>
	{
		const opts = options({ sortQueries:httpOnly });
		let url1,url2;

		url1 = new URL("http://user:pass@www.domain.com:123/dir/file.html?var1=value1&var2=value&var1=value2#hash");
		url2 =         "http://user:pass@www.domain.com:123/dir/file.html?var1=value1&var1=value2&var2=value#hash";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = "other://user:pass@www.domain.com:123/dir/file.html?var1=value1&var2=value&var1=value2#hash";
		url2 = new URL(url1);
		expect( minURL(url2,opts) ).to.equal(url1);
	});



	it("stringify = false", () =>
	{
		const opts = options({ removeRootTrailingSlash:true, removeTrailingSlash:true, stringify:false });
		let url1,url2;

		url1 = new URL("http://user:pass@www.domain.com:123/");
		url2 = minURL(new URL(url1), opts);
		expect(url2).to.be.an.instanceOf(URL);
		expect(url2).to.deep.equal(url1);

		url1 = new URL("http://user:pass@www.domain.com:123/dir/");
		url2 = minURL(new URL(url1), opts);
		expect(url2).to.be.an.instanceOf(URL);
		expect(url2).to.deep.equal(url1);
	});



	it("stringify = true", () =>
	{
		const opts = options({ removeRootTrailingSlash:true, removeTrailingSlash:true });
		let url1,url2;

		url1 = new URL("http://user:pass@www.domain.com:123/");
		url2 =         "http://user:pass@www.domain.com:123";
		expect( minURL(url1,opts) ).to.equal(url2);

		url1 = new URL("http://user:pass@www.domain.com:123/dir/");
		url2 =         "http://user:pass@www.domain.com:123/dir";
		expect( minURL(url1,opts) ).to.equal(url2);
	});



	it("clone = false, removeWWW = true, stringify = false", () =>
	{
		const opts = options({ removeWWW:true, stringify:false });
		const url = new URL("http://user:pass@www.domain.com/");
		const result = minURL(url, opts);

		expect(result).to.equal(url);
		expect(result.href).to.equal("http://user:pass@domain.com/");
	});



	it("clone = true, removeWWW = true, stringify = false", () =>
	{
		const opts = options({ clone:true, removeWWW:true, stringify:false });
		const url = new URL("http://user:pass@www.domain.com/");
		const result = minURL(url, opts);

		expect(result).to.not.equal(url);
		expect(result.href).to.equal("http://user:pass@domain.com/");
	});



	describe("in careful profile", () =>
	{
		it("works", () =>
		{
			const opts = minURL.CAREFUL_PROFILE;
			let url1,url2;

			// plusQueries
			// removeDefaultPort
			// removeEmptyHash
			// ~~removeEmptyQueries~~
			// ~~removeIndexFilename~~
			// removeQueryOddities
			// removeRootTrailingSlash
			// ~~removeTrailingSlash~~
			// ~~removeWWW~~
			// ~~sortQueries~~
			url1 = new URL("http://user:pass@www.domain.com:80/?va%20r2=%20dir&var1=text&var3=#");
			url2 =         "http://user:pass@www.domain.com?va+r2=+dir&var1=text&var3";
			expect( minURL(url1,opts) ).to.equal(url2);

			url1 = new URL("https://user:pass@www.domain.com:443/?va%20r2=%20dir&var1=text&var3=#");
			url2 =         "https://user:pass@www.domain.com?va+r2=+dir&var1=text&var3";
			expect( minURL(url1,opts) ).to.equal(url2);

			// plusQueries
			// removeDefaultPort
			// removeEmptyHash
			// ~~removeEmptyQueries~~
			// ~~removeIndexFilename~~
			// removeQueryOddities
			// ~~removeRootTrailingSlash~~
			// ~~removeTrailingSlash~~
			// ~~removeWWW~~
			// ~~sortQueries~~
			url1 = new URL("http://user:pass@www.domain.com:80/dir/?va%20r2=%20dir&var1=text&var3=#");
			url2 =         "http://user:pass@www.domain.com/dir/?va+r2=+dir&var1=text&var3";
			expect( minURL(url1,opts) ).to.equal(url2);

			url1 = new URL("https://user:pass@www.domain.com:443/dir/?va%20r2=%20dir&var1=text&var3=#");
			url2 =         "https://user:pass@www.domain.com/dir/?va+r2=+dir&var1=text&var3";
			expect( minURL(url1,opts) ).to.equal(url2);

			// plusQueries
			// removeDefaultPort
			// removeEmptyHash
			// ~~removeEmptyQueries~~
			// ~~removeIndexFilename~~
			// removeQueryOddities
			// ~~removeRootTrailingSlash~~
			// ~~removeTrailingSlash~~
			// ~~removeWWW~~
			// ~~sortQueries~~
			url1 = new URL("http://user:pass@www.domain.com:80/dir/index.html?va%20r2=%20dir&var1=text&var3=#");
			url2 =         "http://user:pass@www.domain.com/dir/index.html?va+r2=+dir&var1=text&var3";
			expect( minURL(url1,opts) ).to.equal(url2);

			url1 = new URL("https://user:pass@www.domain.com:443/dir/index.html?va%20r2=%20dir&var1=text&var3=#");
			url2 =         "https://user:pass@www.domain.com/dir/index.html?va+r2=+dir&var1=text&var3";
			expect( minURL(url1,opts) ).to.equal(url2);

			// plusQueries
			// removeDefaultPort
			// removeEmptyHash
			// ~~removeEmptyQueries~~
			// ~~removeIndexFilename~~
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
			// removeEmptyHash
			// removeEmptyQueries
			// ~~removeIndexFilename~~
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
			// ~~removeEmptyHash~~
			// ~~removeEmptyQueries~~
			// ~~removeIndexFilename~~
			// removeQueryOddities
			// removeRootTrailingSlash
			// ~~removeTrailingSlash~~
			// ~~removeWWW~~
			// ~~sortQueries~~
			url1 = new URL("other://user:pass@www.domain.com:123/?");
			url2 =         "other://user:pass@www.domain.com:123";
			expect( minURL(url1,opts) ).to.equal(url2);
		});
	});



	const commonProfileTests = opts =>
	{
		it("works", () =>
		{
			let url1,url2;

			// plusQueries
			// removeDefaultPort
			// removeEmptyHash
			// ~~removeEmptyQueries~~
			// removeIndexFilename
			// removeQueryOddities
			// removeRootTrailingSlash
			// ~~removeTrailingSlash~~
			// removeWWW
			// ~~sortQueries~~
			url1 = new URL("http://user:pass@www.domain.com:80/index.html?va%20r2=%20dir&var1=text&var3=#");
			url2 =         "http://user:pass@domain.com?va+r2=+dir&var1=text&var3";
			expect( minURL(url1,opts) ).to.equal(url2);

			url1 = new URL("https://user:pass@www.domain.com:443/index.html?va%20r2=%20dir&var1=text&var3=#");
			url2 =         "https://user:pass@domain.com?va+r2=+dir&var1=text&var3";
			expect( minURL(url1,opts) ).to.equal(url2);

			// plusQueries
			// removeDefaultPort
			// removeEmptyHash
			// ~~removeEmptyQueries~~
			// removeIndexFilename
			// removeQueryOddities
			// ~~removeRootTrailingSlash~~
			// ~~removeTrailingSlash~~
			// removeWWW
			// ~~sortQueries~~
			url1 = new URL("http://user:pass@www.domain.com:80/dir/index.html?va%20r2=%20dir&var1=text&var3=#");
			url2 =         "http://user:pass@domain.com/dir/?va+r2=+dir&var1=text&var3";
			expect( minURL(url1,opts) ).to.equal(url2);

			url1 = new URL("https://user:pass@www.domain.com:443/dir/index.html?va%20r2=%20dir&var1=text&var3=#");
			url2 =         "https://user:pass@domain.com/dir/?va+r2=+dir&var1=text&var3";
			expect( minURL(url1,opts) ).to.equal(url2);

			// plusQueries
			// removeDefaultPort
			// removeEmptyHash
			// ~~removeEmptyQueries~~
			// ~~removeIndexFilename~~
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
			// removeEmptyHash
			// removeEmptyQueries
			// ~~removeIndexFilename~~
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
			// ~~removeEmptyHash~~
			// ~~removeEmptyQueries~~
			// ~~removeIndexFilename~~
			// removeQueryOddities
			// removeRootTrailingSlash
			// ~~removeTrailingSlash~~
			// ~~removeWWW~~
			// ~~sortQueries~~
			url1 = new URL("other://user:pass@www.domain.com:123/?");
			url2 =         "other://user:pass@www.domain.com:123";
			expect( minURL(url1,opts) ).to.equal(url2);
		});



		describe("with URL implementations lacking searchParams", () =>
		{
			const opts2 = { ...opts, clone:false };  // avoids using Node's `URL` on >=7.x
			let IncompleteURL;

			before(() => IncompleteURL = customizeURL({ urlExclusions:["searchParams"] }).IncompleteURL);

			it("works", () =>
			{
				// plusQueries
				// ~~removeDefaultPort~~
				// removeEmptyHash
				// removeEmptyQueries
				// ~~removeIndexFilename~~
				// removeQueryOddities
				// ~~removeRootTrailingSlash~~
				// ~~removeTrailingSlash~~
				// ~~removeWWW~~
				// sortQueries
				const url1 = new IncompleteURL("mailto:email@www.domain.com:123?subject=hello%20world&cc=user@domain.com&body=&#");
				const url2 =                   "mailto:email@www.domain.com:123?subject=hello+world&cc=user@domain.com&body&";
				expect( minURL(url1,opts2) ).to.equal(url2);
			});
		});



		describe("with URL implementations lacking searchParams::sort", () =>
		{
			const opts2 = { ...opts, clone:false };  // avoids using Node's `URL` on >=7.x
			let IncompleteURL;

			before(() => IncompleteURL = customizeURL({ paramsExclusions:["sort"] }).IncompleteURL);

			it("works", () =>
			{
				// plusQueries
				// ~~removeDefaultPort~~
				// removeEmptyHash
				// removeEmptyQueries
				// ~~removeIndexFilename~~
				// removeQueryOddities
				// ~~removeRootTrailingSlash~~
				// ~~removeTrailingSlash~~
				// ~~removeWWW~~
				// sortQueries
				const url1 = new IncompleteURL("mailto:email@www.domain.com:123?subject=hello%20world&cc=user@domain.com&body=&#");
				const url2 =                   "mailto:email@www.domain.com:123?subject=hello+world&cc=user%40domain.com";
				expect( minURL(url1,opts2) ).to.equal(url2);
			});
		});
	}



	describe("in common profile", () =>
	{
		commonProfileTests(minURL.COMMON_PROFILE);
	});



	describe("in default profile", () =>
	{
		commonProfileTests();
	});
});
