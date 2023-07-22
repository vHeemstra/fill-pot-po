import Vinyl from 'vinyl';
// // import { Buffer } from 'node:buffer';
// import { Buffer } from 'safe-buffer';

/**
 * Escape string for literal match in regex.
 *
 * @link https://stackoverflow.com/a/6969486/2142071
 *
 * @param  {string}  string
 * @return {string}
 */
export const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
};

/**
 * Determine if `value` is an array or not.
 *
 * @param  {mixed}  value
 * @return {boolean}
 */
export const isArray = (value: unknown): value is Array<unknown> => {
  return Object.prototype.toString.call(value) === '[object Array]';
};

/**
 * Determine if `value` is a object or not.
 *
 * @param  {mixed}  value
 * @return {boolean}
 */
type NonArrayObject = object & { length?: never };
export const isObject = (value: unknown): value is NonArrayObject => {
  return Object.prototype.toString.call(value) === '[object Object]';
};

/**
 * Determine if `value` is a string or not.
 *
 * @param  {mixed}  value
 * @return {boolean}
 */
export const isString = (value: unknown): value is string => {
  return Object.prototype.toString.call(value) === '[object String]';
};

/**
 * Determine if `value` is a boolean or not.
 *
 * @param  {mixed}  value
 * @return {boolean}
 */
export const isBool = (value: unknown): value is boolean => {
  return Object.prototype.toString.call(value) === '[object Boolean]';
};

/**
 * Determine if `value` is a Vinyl object or not.
 *
 * @param  {mixed}  value
 * @return {boolean}
 */
export const isVinyl = (value: unknown): value is Vinyl => {
  return Vinyl.isVinyl(value);
};

/**
 * Determine if `value` is an array containing only strings or not.
 *
 * @param  {mixed}  value
 * @return {boolean}
 */
export const isArrayOfStrings = (value: unknown): value is Array<string> => {
  if (!isArray(value)) return false;
  return Boolean(
    value.reduce((r: boolean, v: unknown) => isString(v) && r, true)
  );
};

/**
 * Determine if `value` is an array containing only Vinyl objects or not.
 *
 * @param  {mixed}  value
 * @return {boolean}
 */
export const isArrayOfVinyls = (value: unknown): value is Array<Vinyl> => {
  if (!isArray(value)) return false;
  return Boolean(value.reduce((r, v) => isVinyl(v) && r, true));
};

/**
 * Determine if `value` is an array containing only Buffer objects or not.
 *
 * @param  {mixed}  value
 * @return {boolean}
 */
// export const isArrayOfBuffers = (value: unknown): value is Array<Buffer> => {
//   if (!isArray(value)) return false;
//   return value.reduce((r, v) => Buffer.isBuffer(v) && r, true);
// };

/**
 * Determine if `value` is an array containing only Vinyl objects and Buffers.
 *
 * @param  {mixed}  value
 * @return {boolean}
 */
// export const isArrayOfVinylsOrBuffers = (
//   value: unknown
// ): value is Array<Vinyl | Buffer> => {
//   if (!isArray(value)) return false;
//   return value.reduce((r, v) => isVinyl(v) && r, true);
// };

/**
 * Array sort callback for file reference strings (optionally with line numbers).
 * e.g. strings like 'some/file_path.js:123'
 *
 * @param  {string}  a  Filepath (optionally with ':' + line number)
 * @param  {string}  b  Filepath (optionally with ':' + line number)
 * @return {number}  -1, 0 or 1
 */
export const pathLineSort = (a: string, b: string): number => {
  if (!isString(a) || !isString(b)) {
    throw new Error('pathLineSort: a or b not a string');
  }

  // split line numbers
  let a_line: string | undefined, b_line: string | undefined;
  [a, a_line] = a.split(':');
  [b, b_line] = b.split(':');

  // trim leading/trailing slashes
  a = a.replace(/(^\/|\/$)/g, '');
  b = b.replace(/(^\/|\/$)/g, '');

  // line numbers ascending for same paths
  if (a === b) {
    // no line number first
    if ((!a_line || '' === a_line) && b_line && b_line.length) return -1;
    if ((!b_line || '' === b_line) && a_line && a_line.length) return +1;

    if (a_line && a_line.length && b_line && b_line.length) {
      return parseInt(a_line) - parseInt(b_line);
    }
  }

  // split by directory
  const a_ar = a.split('/');
  const b_ar = b.split('/');

  const a_len = a_ar.length;
  const b_len = b_ar.length;

  // Based on: path-sort package
  const l = Math.max(a_len, b_len);
  for (let i = 0; i < l; i++) {
    // less deep paths at the end
    if (i >= b_len || !b_ar[i]) return -1;
    if (i >= a_len || !a_ar[i]) return +1;

    // split extension
    const [a_part, a_ext] = a_ar[i].split(/\.(?=[^.]*$)/g);
    const [b_part, b_ext] = b_ar[i].split(/\.(?=[^.]*$)/g);
    const a_is_file = a_ext && '' !== a_ext;
    const b_is_file = b_ext && '' !== b_ext;

    // files after folders
    if (!a_is_file && b_is_file) return -1;
    if (a_is_file && !b_is_file) return +1;

    // file/folder name - alphabetical ascending
    if (a_part.toUpperCase() > b_part.toUpperCase()) return +1;
    if (a_part.toUpperCase() < b_part.toUpperCase()) return -1;

    // file extension - alphabetical ascending
    if (a_ext && b_ext) {
      if (a_ext.toUpperCase() > b_ext.toUpperCase()) return +1;
      if (a_ext.toUpperCase() < b_ext.toUpperCase()) return -1;
    }
  }

  return 0;
};
