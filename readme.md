# fill-pot-po

## Information

| Package     | fill-pot-po                                                        |
| ----------- | ------------------------------------------------------------------ |
| Description | Generate pre-filled PO files from POT file, using source PO files. |

## Install

```sh
npm install --save-dev fill-pot-po
```

## Example usage

### Basic - Asynchronous using callback (recommended default)

```js
const fillPotPo = require('fill-pot-po');

const cb = results => {
    // results[0] - (bool) Processed successfull
    // results[1] - (array) Array of arrays with processed PO files, like:
    //              [
    //                  [
    //                      (string) po_file_name,
    //                      (Buffer) po_file_contents
    //                  ],
    //                  ..etc
    //              ]
};

fillPotPo( cb, {
    // options
} );
```

### Basic - Synchronous

```js
const fillPotPo = require('fill-pot-po').sync;

const results = fillPotPo( {
    // options
} );

// results[0] - (bool) Processed successfull
// results[1] - (array) Array of arrays with processed PO files, like:
//              [
//                  [
//                      (string) po_file_name,
//                      (Buffer) po_file_contents
//                  ],
//                  ..etc
//              ]

```

## Options

...

## Related

- [gulp-fill-pot-po](https://github.com/vheemstra/gulp-fill-pot-po) - Run fill-pot-po in gulp
- [gettext-parser](https://github.com/smhg/gettext-parser) - Parse and compile gettext PO and MO files with NodeJS
- [gulp-wp-pot](https://github.com/wp-pot/gulp-wp-pot) - Generate POT files in WordPress project in gulp

## License

MIT © [Philip van Heemstra](https://github.com/vheemstra)
