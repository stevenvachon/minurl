# minurl [![NPM Version][npm-image]][npm-url] ![File Size][filesize-image] [![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Dependency Monitor][greenkeeper-image]][greenkeeper-url]

> Reduce and normalize the components of a [`URL`](https://mdn.io/URL).


## Installation

[Node.js](https://nodejs.org) `>= 14` is required. To install, type this at the command line:
```shell
npm install minurl
```


## Usage
```js
const minURL = require('minurl');

const url = new URL('http://www.domain.com/index.html?param1=va%20lue&param2=');

minURL(url, options);
//-> http://domain.com?param1=va+lue&param2
```

**Note:** "www" subdomains and "index.html" indexes are *not* part of *any* specification. They are merely a common configuration on many HTTP servers. Consider this when deciding on which options to use.


## Options

It is simplest to use an [option profile](#option-profiles), but custom configurations are still possible.

### `clone`
Type: `Boolean`  
Default value: `true`  
When set to `true`, the input `URL` will first be cloned before any changes are made. When set to `false`, the input `URL` will be mutated.

### `defaultPorts`
Type: `Object`  
Default value: `{'ftps:':990, 'git:':9418, 'scp:':22, 'sftp:':22, 'ssh:':22}`  
A map of protocol default ports for [`removeDefaultPort`](#removedefaultport). Be sure to include the suffixed ":" in the key. [Common protocols](https://url.spec.whatwg.org/#special-scheme) already have their ports removed.

### `indexFilenames`
Type: `Array<RegExp|string>`  
Default value: `['index.html']`  
A list of file names for [`removeIndexFilename`](#removeindexfilename).

### `plusQueries`
Type: `Boolean` or `Function`  
Default value: `true`  
When set to `true` or a function that returns `true`, a URL will use "+" instead of "%20" to encode spaces in query parameter names and values.

### `queryNames`
Type: `Array<RegExp|string>`  
Default value: `[]`  
A list of query parameters for [`removeQueryNames`](#removequerynames).

### `removeAuth`
Type: `Boolean` or `Function`  
Default value: `false`  
When set to `true` or a function that returns `true`, a URL's username and password will be removed.

### `removeDefaultPort`
Type: `Boolean` or `Function`  
Default value: `true`  
When set to `true` or a function that returns `true`, a URL's port that matches any found in [`defaultPorts`](#defaultports) will be removed.

### `removeEmptyHash`
Type: `Boolean` or `Function`  
Default value: `true`  
When set to `true` or a function that returns `true`, a URL hash value of "#" will be removed.

### `removeEmptyQueries`
Type: `Boolean` or `Function`  
Default value: [`Function`](https://github.com/stevenvachon/minurl/blob/master/src/minurl.js#L101-L104)  
When set to `true` or a function that returns `true`, a URL's empty query parameters (such as "?=") will be removed.

### `removeEmptyQueryNames`
Type: `Boolean` or `Function`  
Default value: [`Function`](https://github.com/stevenvachon/minurl/blob/master/src/minurl.js#L94-L97)  
When set to `true` or a function that returns `true`, a URL's query parameters that contain a value with no name (such as "?=value") will be removed.

### `removeEmptyQueryValues`
Type: `Boolean` or `Function`  
Default value: [`Function`](https://github.com/stevenvachon/minurl/blob/master/src/minurl.js#L94-L97)  
When set to `true` or a function that returns `true`, a URL's query parameters that contain no value (such as "?var=" and "?var") will be removed.

### `removeEmptySegmentNames`
Type: `Boolean` or `Function`  
Default value: `false`  
When set to `true` or a function that returns `true`, empty segment names within a URL's path will be removed. For example, the "//" in "/path//to/" will become "/path/to/". Protocol-relative URLs will not be affected.

### `removeHash`
Type: `Boolean` or `Function`  
Default value: `false`  
When set to `true` or a function that returns `true`, a URL's hash will be removed.

### `removeIndexFilename`
Type: `Boolean` or `Function`  
Default value: [`Function`](https://github.com/stevenvachon/minurl/blob/master/src/minurl.js#L87-L90)  
When set to `true` or a function that returns `true`, a URL's file name that matches any found in [`indexFilenames`](#indexfilenames) will be removed.

### `removeQueryNames`
Type: `Boolean` or `Function`  
Default value: `false`  
When set to `true` or a function that returns `true`, a URL's query parameters matching [`queryNames`](#querynames) will be removed.

### `removeQueryOddities`
Type: `Boolean` or `Function`  
Default value: `true`  
When set to `true` or a function that returns `true`, a URL's unnecessary occurrences of "?", "=" and "&" characters will be removed.

### `removeRootTrailingSlash`
Type: `Boolean` or `Function`  
Default value: `true`  
When set to `true` or a function that returns `true`, a URL's *root* trailing slash (such as `http://domain.com/?var`) will be removed.

### `removeTrailingSlash`
Type: `Boolean` or `Function`  
Default value: `false`  
When set to `true` or a function that returns `true`, *any* trailing slash in a URL (such as `http://domain.com/dir/`) will be removed.

### `removeWWW`
Type: `Boolean` or `Function`  
Default value: [`Function`](https://github.com/stevenvachon/minurl/blob/master/src/minurl.js#L87-L90)  
When set to `true` or a function that returns `true`, a URL's "www" subdomain will be removed.

### `sortQueries`
Type: `Boolean` or `Function`  
Default value: [`Function`](https://github.com/stevenvachon/minurl/blob/master/src/minurl.js#L101-L104)  
When set to `true` or a function that returns `true`, a URL's query parameters will be sorted alphanumerically.

### `stringify`
Type: `Boolean`  
Default value: `true`  
When set to `true`, a string will be returned. When set to `false`, a `URL` will be returned. Beware that the [`removeRootTrailingSlash`](#removeroottrailingslash) and [`removeTrailingSlash`](#removetrailingslash) options can only be applied when this option is set to `true`.


### Option as a Function

When an option is defined as a `Function`, it must return `true` to be included in the custom filter:
```js
const options = {
  removeIndexFilename: url => {
    // Only URLs with these protocols will have their index filename removed
    return url.protocol === 'http:' && url.protocol === 'https:';
  }
};
```


### Option Profiles

`CAREFUL_PROFILE` is useful for a URL to an unknown or third-party server that could be incorrectly configured according to specifications and common best practices.

`COMMON_PROFILE`, the default profile, is useful for a URL to a known server that you trust and expect to be correctly configured according to specifications and common best practices.

An example of checking for a trusted hostname:
```js
const profile = url => {
  const trustedHosts = ['domain.com'];

  const isTrusted = trustedHosts.some(trustedHost => {
    return url.hostname === trustedHost || url.hostname.endsWith(`.${trustedHost}`);
  });

  return minURL[`${isTrusted ? 'COMMON' : 'CAREFUL'}_PROFILE`];
};

const url1 = new URL('http://www.domain.com/index.html?param1=va%20lue&param2=');
const url2 = new URL('http://www.fake-domain.com/index.html?param1=va%20lue&param2=');

minURL(url1, profile(url1));  // will use "common" profile
minURL(url2, profile(url2));  // will use "careful" profile
```


#### Customizing Profiles

```js
const custom = {
  ...minURL.COMMON_PROFILE,
  indexFilenames: ['index.html', 'index.php']
};
```
Or:
```js
const extend = require('extend');

const custom = extend(true, {}, minURL.COMMON_PROFILE, { indexFilenames:['index.php'] });
```


[npm-image]: https://img.shields.io/npm/v/minurl.svg
[npm-url]: https://npmjs.com/package/minurl
[filesize-image]: https://img.shields.io/badge/bundle-40kB%20gzipped-blue.svg
[travis-image]: https://img.shields.io/travis/stevenvachon/minurl.svg
[travis-url]: https://travis-ci.org/stevenvachon/minurl
[coveralls-image]: https://img.shields.io/coveralls/stevenvachon/minurl.svg
[coveralls-url]: https://coveralls.io/github/stevenvachon/minurl
[greenkeeper-image]: https://badges.greenkeeper.io/stevenvachon/minurl.svg
[greenkeeper-url]: https://greenkeeper.io/
