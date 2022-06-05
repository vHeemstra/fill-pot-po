# fill-pot-po

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
        <td><code>string|array</code> Alternatively, a glob string or array can be provided that will be used as <strong>options.poSources</strong>. All other options will have their default values.</td>
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
        <td><code>string|array</code> Alternatively, a glob string or array can be provided that will be used as <strong>options.poSources</strong>. All other options will have their default values.</td>
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
> By default, or if falsy, the module will look for PO files with filenames like `{text-domain}-{locale}.po` or `{locale}.po` if `domainInPOPath` is set to false.
> 
> `{text-domain}` is either the POT filename or the value set in the `domain` option.
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
> Match source PO files with the text domain name in the filename. For example: `text-domain-en_EN.po` and `text-domain-nl_NL.po`.
> 
> See also [`domainFromPOTPath`](#domainfrompotpath) and [`domain`](#domain).

Default: `true`

#### domainFromPOTPath
`boolean`
> Whether or not to get the text domain from the POT filename (excluding extension).
> 
> If set to `false` and `domainInPOPath` is `true`, a domain must be set using the `domain` option.

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
> _**NOTE**_: If `returnPOT` is `true`, you need to set `writeFiles` to `true` or else no PO files will be generated and the plugin throws an error.

Default: `false`

#### writeFiles
`boolean`
> Whether or not to write the newly generated PO files to disk.
> 
> If you wish to process the results array and content buffers yourself, you could set this to `false`.
> 
> _**NOTE**_: When using `gulp-fill-pot-po`, the default is `false`, since the resulting buffers will probably be `.pipe()`'d to a `.dest()` which writes them to disk instead.

Default: `true` (for gulp-fill-pot-po: `false`)

#### destDir
`string`
> (Only if `writeFiles` is `true`) Relative path from current working directory or absolute path to the folder where the PO files should be written.

Default: `''`

#### logResults
`boolean`
> Log results to console.

Default: `false`

### Options related to generating PO content

#### wrapLength
`integer`
> Line wrapping length excluding quotation marks. The is forwarded as `foldLength` to [`gettext-parser`](https://github.com/smhg/gettext-parser#compile-po-from-a-translation-object).

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
`array` Array of [Vinyl](https://github.com/gulpjs/vinyl) file objects, depending on the value of `options.returnPOT`:
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

### Result - Sync mode

#### On success
`array` Returns an array of [Vinyl](https://github.com/gulpjs/vinyl) file objects, depending on the value of `options.returnPOT`:
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
