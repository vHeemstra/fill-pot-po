# fill-pot-po &nbsp;&nbsp;[![GitHub release (latest SemVer)][release-image]][release-url] [![NPM version][npm-image]][npm-url]

[![Build Status][ci-image]][ci-url]
[![Coverage Status][coverage-image]][coverage-url]
[![Dependencies Status][deps-image]][deps-url]
[![Downloads][downloads-image]][npm-url]

> Generate pre-filled PO files from POT file, using source PO files.
> 
> *Based on the POT filename or set options, it looks for source PO files. For each PO file, it will create a new one, based on the contents of the POT file. The source PO file is used to fill in the matching translated strings.*


## Install

```bash
npm install --save-dev fill-pot-po
```


## Usage

The `fill-pot-po` module exports an asynchronous and a synchronous method.

Depending on the chosen method, the result and the handling of the result is slightly different (see examples below).

### 1. Asynchronous (recommended)

### `fillPotPo( cb, options )`

Processes the POT files and found PO files in parallel.

<table>
    <tr>
        <td><strong>cb</strong></td>
        <td><code>required</code></td>
        <td><code>function</code> Callback function, with one argument containing the results (see <a href="#results---async-mode">Results</a>).</td>
    </tr>
    <tr>
        <td rowspan="2"><strong>options</strong></td>
        <td rowspan="2"><code>optional</code></td>
        <td><code>object</code> Options object (see <a href="#options">Options</a>).</td>
    </tr>
    <tr>
        <td><code>string|array</code> Alternatively, a glob string or array can be provided that will be used as <a href="#posources"><code>options.poSources</code></a>. All other options will have their default values.</td>
    </tr>
</table>

#### Example

```js
const fillPotPo = require('fill-pot-po');

const cb = results => {
    // ...
};

fillPotPo( cb, options );
```

### 2. Synchronous

### `fillPotPoSync( options )`

Processes the POT files and found PO files in series (slower).

<table>
    <tr>
        <td rowspan="2"><strong>options</strong></td>
        <td rowspan="2"><code>optional</code></td>
        <td><code>object</code> Options object (see <a href="#options">Options</a>).</td>
    </tr>
    <tr>
        <td><code>string|array</code> Alternatively, a glob string or array can be provided that will be used as <a href="#posources"><code>options.poSources</code></a>. All other options will have their default values.</td>
    </tr>
    <tr>
        <td colspan="2"><strong><em>returns</em></strong></td>
        <td><code>array</code> Results array on success (see <a href="#results---sync-mode">Results</a>).</td>
    </tr>
    <tr>
        <td colspan="2"><strong><em>throws</em></strong></td>
        <td><code>PluginError</code> On error ;)</td>
    </tr>
</table>

#### Example

```js
const fillPotPoSync = require('fill-pot-po').sync;

try {
    const results = fillPotPoSync( options );

    //...
} catch ( error ) {
    console.log( error );
}

```


## Options

### potSources
`string|Vinyl|array`
> The POT files to process. Can be a path or glob string, a Vinyl object, an array of strings or an array of Vinyl objects.

Default: `['**/*.pot', '!node_modules/**']`

### Options related to locating PO files

#### poSources
`string|array`
> The PO source files to use. Can be a path or glob string, or an array of paths/globs.
> 
> By default, or if falsy, the module will look for PO files with filenames like `{text-domain}-{locale}.po` or `{locale}.po` if [`domainInPOPath`](#domaininpopath) is set to false.
> 
> `{text-domain}` is either the POT filename or the value set in the [`domain`](#domain) option.
> 
> See also [`domainInPOPath`](#domaininpopath), [`domainFromPOTPath`](#domainfrompotpath) and [`domain`](#domain).

Default: `null`

#### srcDir
`string`
> Relative path from current working directory or absolute path to folder where source PO files can be found.
> 
> By default, the same folder as the POT file will be used.

Default: `''`

#### domainInPOPath
`boolean`
> Match source PO files with the text domain name in the filename.
> 
> For example: `text-domain-en_EN.po` and `text-domain-nl_NL.po`.
> 
> See also [`domainFromPOTPath`](#domainfrompotpath) and [`domain`](#domain).

Default: `true`

#### domainFromPOTPath
`boolean`
> Whether or not to get the text domain from the POT filename (excluding extension).
> 
> If set to `false` and [`domainInPOPath`](#domaininpopath) is `true`, a text domain must be set using the [`domain`](#domain) option.
> 
> See also [`domainInPOPath`](#domaininpopath) and [`domain`](#domain).

Default: `true`

#### domain
`string`
> The text domain slug, like `text-domain`.
> 
> By default this is the POT filename excluding extension and is used to find the right PO source files.
> 
> See also [`domainInPOPath`](#domaininpopath) and [`domainFromPOTPath`](#domainfrompotpath).

Default: `''`

#### srcGlobOptions
`object`
> Glob options used when matching PO source files.

Default: `{}`

### Options related to output

#### returnPOT
`boolean`
> Whether the plugin should return the source POT file(s) (`true`) or the generated PO file(s) (`false`).
> 
> By default, it will return the generated PO files.
> 
> _**NOTE**_: If set to `true`, you need to set [`writeFiles`](#writefiles) to `true` as well or else no PO files will be generated and the plugin throws an error.

Default: `false`

#### writeFiles
`boolean`
> Whether or not to write the newly generated PO files to disk.
> 
> If you wish to process the results array and content buffers yourself, you could set this to `false`.
> 
> _**NOTE**_: When using [**gulp-fill-pot-po**](https://github.com/vHeemstra/gulp-fill-pot-po), the default is `false`, since the resulting buffers will probably be `.pipe( dest() )`'d, which writes them to disk instead.

Default: `true` (for gulp-fill-pot-po: `false`)

#### destDir
`string`
> _Only if [`writeFiles`](#writefiles) is `true`._
> 
> Relative path from current working directory or absolute path to the folder where the PO files should be written.

Default: `''`

#### logResults
`boolean`
> Log results to console.

Default: `false`

### Options related to generating PO content

#### wrapLength
`integer`
> Line wrapping length excluding quotation marks.
> 
> This is forwarded as `foldLength` to [`gettext-parser`](https://github.com/smhg/gettext-parser#compile-po-from-a-translation-object).

Default: `77`

#### defaultContextAsFallback
`boolean`
> If a string is not found in the PO source file with a certain context, try searching for the same string without a context and use that.
> 
> A flag comment `#, fuzzy` will be added to signal translators to check the translation.

Default: `false`

#### appendNonIncludedFromPO
`boolean`
> Append all translated strings from the source PO file that were not in the POT file.
> 
> A translator comment `# DEPRECATED` will be added to them.

Default: `false`

#### includePORevisionDate
`boolean`
> Include a `PO-Revision-Date` header to the PO files with the current timestamp.

Default: `false`

#### includeGenerator
`boolean`
> Include a `X-Generator` header to the PO files.

Default: `true`


## Results

### Results - Async mode
The first argument of the callback function will be the results array:

#### results[0]
`boolean` True on success, false on error.

#### results[1] (on success)
`array` Array of [Vinyl](https://github.com/gulpjs/vinyl) file objects, depending on the value of [`options.returnPOT`](#returnpot):
<ul><table>
    <tr>
        <td><code>false</code></td>
        <td>The generated PO files. <em>(default)</em></td>
    </tr>
    <tr>
        <td><code>true</code></td>
        <td>The input POT files.</td>
    </tr>
</table>
</ul>

#### results[1] (on error)
`string` Error message.

### Results - Sync mode

#### On success
`array` Returns an array of [Vinyl](https://github.com/gulpjs/vinyl) file objects, depending on the value of [`options.returnPOT`](#returnpot):
<ul><table>
    <tr>
        <td><code>false</code></td>
        <td>The generated PO files. <em>(default)</em></td>
    </tr>
    <tr>
        <td><code>true</code></td>
        <td>The input POT files.</td>
    </tr>
</table>
</ul>

#### On error
On error, `fillPotPoSync()` will throw an error.


## Related

- [gulp-fill-pot-po](https://github.com/vheemstra/gulp-fill-pot-po) - Run fill-pot-po in gulp
- [gettext-parser](https://github.com/smhg/gettext-parser) - Parse and compile gettext PO and MO files with NodeJS
- [gulp-wp-pot](https://github.com/wp-pot/gulp-wp-pot) - Generate POT files in WordPress project in gulp


## License

MIT © [Philip van Heemstra](https://github.com/vheemstra)

[release-url]: https://github.com/vHeemstra/fill-pot-po/releases
[release-image]: https://img.shields.io/github/v/release/vHeemstra/fill-pot-po?sort=semver&logo=github&logoColor=959DA5&labelColor=444D56

[ci-url]: https://github.com/vHeemstra/fill-pot-po/actions/workflows/ci_push_on_main.yml
[ci-image]: https://img.shields.io/github/workflow/status/vHeemstra/fill-pot-po/Lint%20%7C%20Test%20%7C%20Version?label=lint%20%26%20test&logo=github&logoColor=959DA5&labelColor=444D56
[ci-image2]: https://github.com/vHeemstra/fill-pot-po/actions/workflows/ci_push_on_main.yml/badge.svg
[ci-image3]: https://img.shields.io/static/v1?logo=github&logoColor=959DA5&label=lint%20%26%20tests&labelColor=444D56&message=passing&color=34D058

[coverage-url]: https://coveralls.io/github/vHeemstra/fill-pot-po?branch=main
[coverage-image]: https://img.shields.io/coveralls/github/vHeemstra/fill-pot-po?logo=coveralls&logoColor=959DA5&labelColor=444D56
[coverage-image2]: https://coveralls.io/repos/github/vHeemstra/fill-pot-po/badge.svg?branch=main

[deps-url]: https://libraries.io/npm/fill-pot-po
[deps-image]: https://img.shields.io/librariesio/github/vheemstra/fill-pot-po?logo=libraries.io&logoColor=959DA5&labelColor=444D56
[deps-image2]: https://img.shields.io/librariesio/release/npm/gulp-fill-pot-po?logo=libraries.io&logoColor=959DA5&labelColor=444D56

[npm-url]: https://www.npmjs.com/package/fill-pot-po
[npm-image]: https://img.shields.io/npm/v/fill-pot-po.svg?color=cb0000&labelColor=444D56&logo=data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBmaWxsPSIjOTU5REE1IiBkPSJNMS43NjMgMEMuNzg2IDAgMCAuNzg2IDAgMS43NjN2MjAuNDc0QzAgMjMuMjE0Ljc4NiAyNCAxLjc2MyAyNGgyMC40NzRjLjk3NyAwIDEuNzYzLS43ODYgMS43NjMtMS43NjNWMS43NjNDMjQgLjc4NiAyMy4yMTQgMCAyMi4yMzcgMHpNNS4xMyA1LjMyM2wxMy44MzcuMDE5LS4wMDkgMTMuODM2aC0zLjQ2NGwuMDEtMTAuMzgyaC0zLjQ1NkwxMi4wNCAxOS4xN0g1LjExM3oiPjwvcGF0aD48L3N2Zz4=
[downloads-image]: https://img.shields.io/npm/dm/fill-pot-po.svg?labelColor=444D56&logo=data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBmaWxsPSIjOTU5REE1IiBkPSJNMS43NjMgMEMuNzg2IDAgMCAuNzg2IDAgMS43NjN2MjAuNDc0QzAgMjMuMjE0Ljc4NiAyNCAxLjc2MyAyNGgyMC40NzRjLjk3NyAwIDEuNzYzLS43ODYgMS43NjMtMS43NjNWMS43NjNDMjQgLjc4NiAyMy4yMTQgMCAyMi4yMzcgMHpNNS4xMyA1LjMyM2wxMy44MzcuMDE5LS4wMDkgMTMuODM2aC0zLjQ2NGwuMDEtMTAuMzgyaC0zLjQ1NkwxMi4wNCAxOS4xN0g1LjExM3oiPjwvcGF0aD48L3N2Zz4=
