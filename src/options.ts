import { resolve, relative } from 'node:path';
import Vinyl from 'vinyl';
// // import { Buffer } from 'node:buffer';
// import { Buffer } from 'safe-buffer';
import PluginError from './plugin-error';
import {
  isArray,
  isObject,
  isBool,
  isString,
  isArrayOfStrings,
  isArrayOfVinyls,
  // isArrayOfBuffers,
  // isArrayOfVinylsOrBuffers,
} from './utils';

import type {
  ValidatedOptions,
  Options,
  StandardizedOptions,
  Source,
  PreparedOptions,
} from './shared';

// import { sync: matchedSync } from 'matched';
// import { pathLineSort } from './utils';

/**
 * Wrapper for PluginError for all errors with options.
 */
class OptionsError extends PluginError {
  constructor(message) {
    super(message, 'options');
  }
}

/**
 * Validate user supplied options.
 *
 * @param  {mixed} options
 *
 * @throws OptionError on invalid or missing options.
 *
 * @return {object}
 */
export const validateOptionsInput = (options: Options): ValidatedOptions => {
  if (isObject(options)) {
    if (
      'potSources' in options &&
      !isString(options.potSources) &&
      !isArrayOfStrings(options.potSources) &&
      // !Buffer.isBuffer(options.potSources) &&
      // !isArrayOfBuffers(options.potSources) &&
      // !isArrayOfVinylsOrBuffers(options.potSources) &&
      !Vinyl.isVinyl(options.potSources) &&
      !isArrayOfVinyls(options.potSources)
    ) {
      throw new OptionsError(
        'Option potSources should be a string or Vinyl object, or an array of those.'
      );
    }

    if (
      'poSources' in options &&
      // options.poSources &&
      options.poSources !== null &&
      !isString(options.poSources) &&
      !isArrayOfStrings(options.poSources)
    ) {
      throw new OptionsError(
        'Option poSources should be a glob string or glob array.'
      );
    }

    if (
      'wrapLength' in options &&
      (typeof options.wrapLength !== 'number' || 0 >= options.wrapLength)
    ) {
      throw new OptionsError(
        'If set, option wrapLength should be a number higher than 0.'
      );
    }

    const if_set_string_without_newlines: (keyof ValidatedOptions)[] = [
      'srcDir',
      'destDir',
      'domain',
    ];
    for (const k of if_set_string_without_newlines) {
      if (k in options) {
        if (!isString(options[k])) {
          throw new OptionsError(`Option ${k} should be a string.`);
        } else if (options[k].match(/\n/)) {
          throw new OptionsError(
            `Option ${k} can't contain newline characters.`
          );
        }
      }
    }

    const if_set_bool: (keyof ValidatedOptions)[] = [
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
    for (const k of if_set_bool) {
      if (k in options && !isBool(options[k])) {
        throw new OptionsError(`Option ${k} should be a boolean.`);
      }
    }
  } else if (isString(options) || isArrayOfStrings(options)) {
    return {
      poSources: options,
    };
  } else if (typeof options !== 'undefined') {
    throw new OptionsError(
      'Options should be an object of options, glob string or glob array.'
    );
  } else {
    return {};
  }

  // options;
  return options as ValidatedOptions;
};

/**
 * Clean and standardize user supplied options.
 *
 * @param  {object} options
 *
 * @return {object}
 */
export const sanitizeAndStandardizeOptionsInput = (
  options: ValidatedOptions
): StandardizedOptions => {
  const cwd = resolve();

  if (typeof options.potSources !== 'undefined') {
    if (!isArray(options.potSources)) {
      options.potSources = [options.potSources];
    }
    options.potSources = options.potSources
      .map((v: Source) => (isString(v) ? v.trim() : v))
      .filter((v: Source) => !isString(v) || v.length > 0);
  }

  if (typeof options.poSources !== 'undefined' && options.poSources !== null) {
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
      .replace(/\\/g, '/') // only forward slashes
      .replace(/\/+/g, '/') // remove duplicate slashes
      .replace(/(?<!\.)\.\//g, '') // remove current dirs
      .replace(/^\//g, ''); // remove leading slash
  }

  if (options.destDir) {
    // NOTE: all paths starting with a slash are considered absolute paths
    options.destDir = resolve(options.destDir.trim());
    options.destDir = `${relative(cwd, options.destDir)}/` // add trailing slash
      .replace(/\\/g, '/') // only forward slashes
      .replace(/\/+/g, '/') // remove duplicate slashes
      .replace(/(?<!\.)\.\//g, '') // remove current dirs
      .replace(/^\//g, ''); // remove leading slash
  }

  if (options.wrapLength) {
    // Make integer
    options.wrapLength = Math.ceil(options.wrapLength);
  }

  return options as StandardizedOptions;
};

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
export default (options: Options): PreparedOptions => {
  // Validate/check options
  options = validateOptionsInput(options);

  // Sanitize/clean and standardize options
  options = sanitizeAndStandardizeOptionsInput(options);

  const defaultOptions: PreparedOptions = {
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
    writeFiles: true,
    destDir: '',
    logResults: false,

    // Internals
    _pot_input_files: [],
    _po_input_files: [],
  };

  // Merge with defaults: PreparedOptions
  const resolvedOptions = Object.assign({}, defaultOptions, options);

  /**
   * Check for logical errors
   */

  if (
    resolvedOptions.domainFromPOTPath === false &&
    resolvedOptions.domainInPOPath === true &&
    0 >= resolvedOptions.domain.length
  ) {
    throw new OptionsError(
      'Option domain should be a non-empty string when domainFromPOTPath is false and domainInPOPath is true.'
    );
  }

  if (resolvedOptions.returnPOT && !resolvedOptions.writeFiles) {
    throw new OptionsError(
      'If option returnPOT is true, option writeFiles must be true or no PO files will be generated.'
    );
  }

  return resolvedOptions;
};
