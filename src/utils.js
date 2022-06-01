'use strict';

/**
 * Escape string for literal match in regex.
 *
 * @link https://stackoverflow.com/a/6969486/2142071
 *
 * @param  {string}  string
 *
 * @return {string}
 */
function escapeRegExp(string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
/**
 * Determine if `ar` is an array or not.
 *
 * @param  {mixed}  ar
 *
 * @return {boolean}
 */
function isArray(ar) {
	return Object.prototype.toString.call(ar) === '[object Array]';
}

/**
 * Determine if `obj` is a object or not.
 *
 * @param  {mixed}  obj
 *
 * @return {boolean}
 */
function isObject(obj) {
	return Object.prototype.toString.call(obj) === '[object Object]';
}

/**
 * Determine if `str` is a string or not.
 *
 * @param  {mixed}  str
 *
 * @return {boolean}
 */
function isString(str) {
	return Object.prototype.toString.call(str) === '[object String]';
}

/**
 * Determine if `bl` is a boolean or not.
 *
 * @param  {mixed}  bl
 *
 * @return {boolean}
 */
function isBool(bl) {
	return Object.prototype.toString.call(bl) === '[object Boolean]';
}

/**
 * Determine if `ar` is an array containing only strings or not.
 *
 * @param  {mixed}  ar
 *
 * @return {boolean}
 */
function isArrayOfStrings(ar) {
	if (!isArray(ar)) return false;
	return ar.reduce((r, v) => (isString(v) && r), true);
}

/**
 * Array sort callback for file reference strings (optionally with line numbers).
 * e.g. strings like 'some/file_path.js:123'
 *
 * @param  {string}  filepath (optionally with ':' + line number)
 * @param  {string}  filepath (optionally with ':' + line number)
 *
 * @return {number}  -1, 0 or 1
 */
function pathLineSort(a, b) {
	// Wrapper mode
	if (isArray(a) && typeof b === 'undefined') {
		return a.sort(pathLineSort);
	}

	if (!isString(a) || !isString(b)) {
		throw new Error('pathLineSort: a or b not a string');
	}

	// split line numbers
	let a_line, b_line;
	[a, a_line] = a.split(':');
	[b, b_line] = b.split(':');

	// trim leading/trailing slashes
	a = a.replaceAll(/(^\/|\/$)/g, '');
	b = b.replaceAll(/(^\/|\/$)/g, '');

	// line numbers ascending for same paths
	if (a == b) {
		// no line number first
		if ((!a_line || '' === a_line) && b_line.length) return -1;
		if ((!b_line || '' === b_line) && a_line.length) return +1;

		return (parseInt(a_line) - parseInt(b_line));
	}

	// split by directory
	a = a.split('/');
	b = b.split('/');

	const a_len = a.length;
	const b_len = b.length;

	// Based on: path-sort package
	const l = Math.max(a_len, b_len);
	for (let i = 0; i < l; i++) {
		// less deep paths at the end
		if (i >= b_len || '' === b[i]) return -1;
		if (i >= a_len || '' === a[i]) return +1;

		// split extension
		let a_part, b_part;
		let a_ext, b_ext;
		[a_part, a_ext] = a[i].split(/\.(?=[^.]*$)/g);
		[b_part, b_ext] = b[i].split(/\.(?=[^.]*$)/g);
		const a_is_file = (a_ext && '' !== a_ext);
		const b_is_file = (b_ext && '' !== b_ext);

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
}

module.exports = {
	escapeRegExp,
	isArray,
	isObject,
	isString,
	isBool,
	isArrayOfStrings,
	pathLineSort
};
