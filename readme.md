# fill-pot-po

> Generate pre-filled PO files from POT file, using source PO files.
> 
> *Based on the POT filename or set options, it looks for source PO files. For each PO file, it will create a new one, based on the contents of the POT file. The source PO file is used to fill in the matching translated strings.*


## Install

```sh
npm install --save-dev fill-pot-po
```


## Example usage

### Basic - Asynchronous using callback (recommended default)

```js
const fillPotPo = require('fill-pot-po');

const cb = results => {
    // See `results` section
};

fillPotPo( cb, {
    // See `options` section
} );
```

### Basic - Synchronous

```js
const fillPotPo = require('fill-pot-po').sync;

const results = fillPotPo( {
    // See `options` section
} );

// See `results` section

```


## Results array
The array available as the first argument of the callback function or as returned from the synchronous version of `fill-pot-po`.
The results array has two items:

### results[0]
`boolean` True on success, false on error.

### results[1] (on error)
`string` Error message.

### results[1] (on success)
`array` The generated PO files. Each is an array with:
> [0] `string` filename\
> [1] `Buffer` file contents


## Options
### potSources
`string|array`
> The POT files to process. Can be a path or glob string, or an array of paths/globs.

Default: `['**/*.pot', '!node_modules/**']`

### srcDir
`string`
> Relative path from current working directory or absolute path to folder where source PO files can be found.
> 
> By default, the same folder as the POT file will be used.

Default: `''`

### srcGlobOptions
`object`
> Glob options used when matching PO source files.

Default: `{}`

### domainFromPOTPath
`boolean`
> Whether or not to get the text domain from the POT filename (excluding extension).
> 
> If set to `false` and `domainInPOPath` is `true`, a domain must be set using the `domain` option.

Default: `true`

### domain
`string`
> The text domain slug, like `text-domain`.
> 
> By default this is the POT filename excluding extension is used to find the right PO source files.
> 
> See also `domainFromPOTPath` and `domainInPOPath`.

Default: `''`

### domainInPOPath
`boolean`
> Match source PO files with the text domain name in the filename. For example: `text-domain-en_EN.po` and `text-domain-nl_NL.po`.
> 
> See also `domain` and `domainFromPOTPath`.

Default: `true`

### poSources
`string|array`
> The PO source files to use. Can be a path or glob string, or an array of paths/globs.
> 
> By default, or if falsy, the module will look for PO files with filenames like `{text-domain}-{locale}.po` or `{locale}.po` if `domainInPOPath` is set to `false`. `{text-domain}` is either the POT filename or the value set in the `domain` option.
> 
> See also `domainFromPOTPath`, `domain` and `domainInPOPath`.

Default: `null`

### writeFiles
`boolean`
> Whether or not to write the newly generated PO files to disk.
> 
> If you wish to process the results array and content buffers yourself, you could set this to `false`.
> 
> _**NOTE**_: When using `gulp-fill-pot-po`, the default is `false`, since the resulting buffers will probably be `.pipe()`'d to a `.dest()` which writes them to disk instead.

Default: `true` (for gulp-fill-pot-po: `false`)

### destDir
`string`
> (Only if `writeFiles` is `true`) Relative path from current working directory or absolute path to the folder where the PO files should be written.

Default: `''`

### wrapLength
`integer`
> Line wrapping length excluding quotation marks. The is forwarded as `foldLength` to [`gettext-parser`](https://github.com/smhg/gettext-parser#compile-po-from-a-translation-object).

Default: `77`

### defaultContextAsFallback
`boolean`
> If a string is not found in the PO source file with a certain context, try searching for the same string without a context and use that.
> 
> A flag comment `#, fuzzy` will be added to signal translators to check the translation.

Default: `false`

### appendNonIncludedFromPO
`boolean`
> Append all translated strings from the source PO file that were not in the POT file.
> 
> A translator comment `# DEPRECATED` will be added to them.

Default: `false`

### includePORevisionDate
`boolean`
> Include a `PO-Revision-Date` header to the PO files with the current timestamp.

Default: `false`

### logResults
`boolean`
> Log results to console.

Default: `false`


## Related

- [gulp-fill-pot-po](https://github.com/vheemstra/gulp-fill-pot-po) - Run fill-pot-po in gulp
- [gettext-parser](https://github.com/smhg/gettext-parser) - Parse and compile gettext PO and MO files with NodeJS
- [gulp-wp-pot](https://github.com/wp-pot/gulp-wp-pot) - Generate POT files in WordPress project in gulp

## License

MIT © [Philip van Heemstra](https://github.com/vheemstra)
