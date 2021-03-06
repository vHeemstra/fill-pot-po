'use strict';

const PluginError = require('./plugin-error');
const {
  isArray,
  isObject,
  isString,
  isBool,
  isArrayOfStrings,
  isArrayOfVinyls,
} = require('./utils');
const { isVinyl } = require('vinyl');

// const { sync: matchedSync } = require('matched');
// const { pathLineSort } = require('./utils');
const { resolve, relative } = require('path');

/**
 * Wrapper for PluginError for all errors with options.
 */
class OptionsError extends PluginError {
  constructor(message) {
    super(message, 'options');
  }
}

let cwd = './';

/**
 * Validate user supplied options.
 *
 * @param  {mixed} options
 *
 * @throws OptionError on invalid or missing options.
 *
 * @return {object}
 */
function validateOptionsInput(options) {
  if (isObject(options)) {
    if (
      typeof options.potSources !== 'undefined' &&
      !isString(options.potSources) &&
      !isArrayOfStrings(options.potSources) &&
      !isVinyl(options.potSources) &&
      !isArrayOfVinyls(options.potSources)
    ) {
      throw new OptionsError(
        'Option potSources should be a string or Vinyl object, or an array of those.'
      );
    }

    if (
      typeof options.poSources !== 'undefined' &&
      options.poSources &&
      !isString(options.poSources) &&
      !isArrayOfStrings(options.poSources)
    ) {
      throw new OptionsError(
        'Option poSources should be a glob string or glob array.'
      );
    }

    if (
      typeof options.wrapLength !== 'undefined' &&
      (typeof options.wrapLength !== 'number' || 0 >= options.wrapLength)
    ) {
      throw new OptionsError(
        'If set, option wrapLength should be a number higher than 0.'
      );
    }

    const if_set_string = ['srcDir', 'destDir', 'domain'];
    if_set_string.forEach((k) => {
      if (typeof options[k] !== 'undefined' && !isString(options[k])) {
        throw new OptionsError(`Option ${k} should be a string.`);
      }
    });

    const no_newlines = ['srcDir', 'destDir', 'domain'];
    no_newlines.forEach((k) => {
      if (typeof options[k] !== 'undefined' && options[k].match(/\n/)) {
        throw new OptionsError(`Option ${k} can't contain newline characters.`);
      }
    });

    const if_set_bool = [
      'writeFiles',
      'returnPOT',
      'domainFromPOTPath',
      'domainInPOPath',
      'defaultContextAsFallback',
      'appendNonIncludedFromPO',
      'includePORevisionDate',
      'includeGenerator',
      'logResults',
    ];
    if_set_bool.forEach((k) => {
      if (typeof options[k] !== 'undefined' && !isBool(options[k])) {
        throw new OptionsError(`Option ${k} should be a boolean.`);
      }
    });
  } else if (isString(options) || isArrayOfStrings(options)) {
    options = {
      poSources: options,
    };
  } else if (typeof options !== 'undefined') {
    throw new OptionsError(
      'Options should be an object of options, glob string or glob array.'
    );
  } else {
    options = {};
  }

  return options;
}

/**
 * Clean and standardize user supplied options.
 *
 * @param  {object} options
 *
 * @return {object}
 */
function sanitizeAndStandardizeOptionsInput(options) {
  if (typeof options.potSources !== 'undefined' && options.potSources) {
    if (!isArray(options.potSources)) {
      options.potSources = [options.potSources];
    }
    options.potSources = options.potSources
      .map((v) => (typeof v === 'string' ? v.trim() : v))
      .filter((v) => typeof v !== 'string' || v.length > 0);
  }

  if (typeof options.poSources !== 'undefined' && options.poSources) {
    // Make array with one or more non-empty strings
    if (!isArray(options.poSources)) {
      options.poSources = [options.poSources];
    }
    options.poSources = options.poSources
      .map((v) => v.trim())
      .filter((v) => v.length > 0);
  }

  if (options.srcDir) {
    // NOTE: all paths starting with a slash are considered absolute paths
    options.srcDir = resolve(options.srcDir.trim());
    options.srcDir = `${relative(cwd, options.srcDir)}/` // add trailing slash
      .replaceAll(/\\/g, '/') // only forward slashes
      .replaceAll(/\/+/g, '/') // remove duplicate slashes
      .replaceAll(/(?<!\.)\.\//g, '') // remove current dirs
      .replaceAll(/^\//g, ''); // remove leading slash
  }

  if (options.destDir) {
    // NOTE: all paths starting with a slash are considered absolute paths
    options.destDir = resolve(options.destDir.trim());
    options.destDir = `${relative(cwd, options.destDir)}/` // add trailing slash
      .replaceAll(/\\/g, '/') // only forward slashes
      .replaceAll(/\/+/g, '/') // remove duplicate slashes
      .replaceAll(/(?<!\.)\.\//g, '') // remove current dirs
      .replaceAll(/^\//g, ''); // remove leading slash
  }

  if (options.wrapLength) {
    // Make integer
    options.wrapLength = Math.ceil(options.wrapLength);
  }

  return options;
}

/**
 * Process user supplied options and merge with default options.
 *
 * @param {mixed} options
 * @param {boolean} writeFiles Default value for `options.writeFiles`.
 *
 * @throws OptionError on invalid, missing or incompatible options.
 *
 * @return {object}
 */
function prepareOptions(options, writeFiles) {
  cwd = resolve();

  // Validate/check options
  options = validateOptionsInput(options);

  // Sanitize/clean and standardize options
  options = sanitizeAndStandardizeOptionsInput(options);

  const defaultOptions = {
    // Input-related
    potSources: ['**/*.pot', '!node_modules/**'],
    poSources: null,
    srcDir: '',
    domainInPOPath: true,
    domainFromPOTPath: true,
    domain: '',
    srcGlobOptions: {},

    // Content-related
    wrapLength: 77,
    defaultContextAsFallback: false,
    appendNonIncludedFromPO: false,
    includePORevisionDate: false,
    includeGenerator: true,

    // Output-related
    returnPOT: false,
    writeFiles: typeof writeFiles !== 'undefined' ? writeFiles : true,
    destDir: '',
    logResults: false,
  };

  // Merge with defaults
  options = Object.assign({}, defaultOptions, options);

  /**
   * Check for logical errors
   */

  if (
    options.domainFromPOTPath === false &&
    options.domainInPOPath === true &&
    0 >= options.domain.length
  ) {
    throw new OptionsError(
      'Option domain should be a non-empty string when domainFromPOTPath is false and domainInPOPath is true.'
    );
  }

  if (options.returnPOT && !options.writeFiles) {
    throw new OptionsError(
      'If option returnPOT is true, option writeFiles must be true or no PO files will be generated.'
    );
  }

  return options;
}

module.exports = prepareOptions;
