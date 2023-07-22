import type { Omit } from 'utility-types';
import { basename, dirname } from 'node:path';
// import { Buffer } from 'node:buffer';
import { Buffer } from 'safe-buffer';
import { sync as matchedSync } from 'matched';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import gettextParser from 'gettext-parser';
import Vinyl from 'vinyl';
import c from 'ansi-colors';
import cs from 'color-support';
import { isArray, isString, pathLineSort } from './utils';
import PluginError from './plugin-error';

c.enabled = Boolean(cs().hasBasic);

import { readFileSync } from 'node:fs';
const packageJSON = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf-8')
);

export type Source = string | Vinyl; // | Buffer;

export type Options = string | string[] | ValidatedOptions;

export type ValidatedOptions = {
  // Input-related
  potSources?: Source | Source[];
  poSources?: string | string[] | null;
  srcDir?: string;
  domainInPOPath?: boolean;
  domainFromPOTPath?: boolean;
  domain?: string;
  srcGlobOptions?: object;

  // Content-related
  wrapLength?: number;
  defaultContextAsFallback?: boolean;
  appendNonIncludedFromPO?: boolean;
  includePORevisionDate?: boolean;
  includeGenerator?: boolean;

  // Output-related
  returnPOT?: boolean;
  writeFiles?: boolean;
  destDir?: string;
  logResults?: boolean;
};

export type StandardizedOptions = Omit<
  ValidatedOptions,
  'potSources' | 'poSources'
> & {
  potSources?: Source[];
  poSources?: string[] | null;
};

export type PreparedOptions = Required<StandardizedOptions>;

export type ResolvedOptions = PreparedOptions & {
  _potFilenames: string[];
};

export type PoObject = {
  charset: string;
  headers: {
    [key: string]: string;
  };
  translations: {
    [key: string]: {
      [key: string]: {
        msgctxt?: string; // Context
        msgid: string; // Untranslated (single) string
        msgid_plural?: string; // Untranslated plural string
        msgstr: string[]; // Translated strings (single, plural)
        comments?: {
          [key: string]: string;
          // translator?: string;
          // reference?: string;
          // flag?: string;
        };
      };
    };
  };
};

/**
 * Resolve POT sources globs to filepaths.
 * If options.potSources is array of Vinyl objects, leave them as-is.
 *
 * @param  {object} options
 * @return {object} options
 */
export const resolvePOTFilepaths = (
  options: PreparedOptions
): ResolvedOptions => {
  // Resolve POT filepaths to process, if array of strings
  if (
    isArray(options.potSources) &&
    options.potSources.length &&
    isString(options.potSources[0])
  ) {
    options.potSources = matchedSync(options.potSources) as Source[];
  }

  // Store POT filepaths for logging
  (options as ResolvedOptions)._potFilenames = options.potSources.map((f) =>
    isString(f) ? f : f.path
  );

  if (0 >= options.potSources.length) {
    throw new PluginError('No POT files found to process.');
  }

  if (1 < options.potSources.length && options.poSources) {
    throw new PluginError(
      'When processing multiple POT files, leave option poSources empty.\nElse, the same generated PO files will be overwritten for each POT file.',
      'options'
    );
  }

  return options as ResolvedOptions;
};

/**
 * Get filepaths for all PO files to process.
 *
 * @param  {string} pot_filepath
 * @param  {object} options
 *
 * @return {array} PO filepaths
 */
export const getPOFilepaths = (
  pot_filepath: string,
  options: ResolvedOptions
) => {
  const pot_name = basename(pot_filepath, '.pot');
  const domain = options.domainFromPOTPath ? pot_name : options.domain;
  const po_dir = options.srcDir ? options.srcDir : `${dirname(pot_filepath)}/`;

  // TODO? also search subdirectories?
  //       preserving glob base for re-use at write and/or return paths
  //       use: https://github.com/gulpjs/glob-parent
  // options.srcSearchRecursive = true/false

  // TODO?
  // const srcDirs = matchedSync(`${po_dir}`); // Always has trailing separator

  // Auto-compile PO files glob
  const po_files_glob: string[] = [];
  if (options.poSources) {
    // TODO? prefix all with po_dir ?
    po_files_glob.push(...options.poSources);
  } else {
    const locale_glob = '[a-z][a-z]?([a-z])?(_[A-Z][A-Z]?([A-Z]))?(_formal)';
    const domain_glob = options.domainInPOPath ? `${domain}-` : '';
    po_files_glob.push(`${po_dir}${domain_glob}${locale_glob}.po`);
    // TODO?
    // const sub_dirs = options.srcSearchRecursive ? '**/': '';
    // po_files_glob.push(`${po_dir}${sub_dirs}${domain_glob}${locale_glob}.po`);
  }

  // Find and sort file paths
  const po_filepaths: string[] = matchedSync(
    po_files_glob,
    options.srcGlobOptions
  ).sort(pathLineSort);
  // TODO?
  // store or return srcDirs (for subtracting from PO paths later on)
  return po_filepaths;
};

/**
 * Create the new PO file.
 *
 * - Clones the POT object
 * - Fills the object with available translations from PO file
 * - Compiles new PO content
 * - Optionally writes content to file
 * - Returns Vinyl file object of the new PO file
 *
 * @param  {object} pot_object
 * @param  {object} po_object
 * @param  {string} po_filepath
 * @param  {object} options
 *
 * @return {object} Vinyl file object
 */
export const generatePO = (
  pot_object: PoObject,
  po_object: PoObject,
  po_filepath: string,
  options: ResolvedOptions
): Vinyl => {
  // Deep clone POT as base for the new PO
  let new_po_object: PoObject = JSON.parse(JSON.stringify(pot_object));

  // Pre-fill template with PO strings
  new_po_object = fillPO(new_po_object, po_object, options);

  // Compile object to PO
  const new_po_output = compilePO(new_po_object, options);

  // Optionally, write to file
  // TODO? preserve subdirectories from search glob?
  const new_po_filepath = basename(po_filepath);
  if (options.writeFiles) {
    writePO(`${options.destDir}${new_po_filepath}`, new_po_output);
  }

  // Add Buffer to collection
  return new Vinyl({
    contents: Buffer.from(new_po_output),
    path: new_po_filepath,
  });
};

/**
 * Fill new PO object with translations from PO file.
 *
 * - Finds and uses translations from PO file
 *   When fallback translations from default context are used,
 *   flags these as fuzzy.
 * - Optionally, append all non-included translation strings from PO file
 *   and flags them as "DEPRECATED".
 *   If used as fallback translation, flags with a note about that as well.
 *
 * @param  {object} new_po_object
 * @param  {object} po_object
 * @param  {object} options
 *
 * @return {object} Prefilled PO object
 */
const fillPO = (
  new_po_object: PoObject,
  po_object: PoObject,
  options: ResolvedOptions
) => {
  // Traverse template contexts
  for (const [ctxt, entries] of Object.entries(new_po_object.translations)) {
    // Traverse template entries
    for (const [msgid, entry] of Object.entries(entries)) {
      // If the PO has a translation for this
      // with equal number of strings, use to pre-fill it.
      if (
        po_object.translations[ctxt] &&
        po_object.translations[ctxt][msgid] &&
        po_object.translations[ctxt][msgid]['msgstr'].length ===
          entry['msgstr'].length
      ) {
        new_po_object.translations[ctxt][msgid]['msgstr'] = [
          ...po_object.translations[ctxt][msgid]['msgstr'],
        ];
      } else if (
        options.defaultContextAsFallback &&
        po_object.translations[''] &&
        po_object.translations[''][msgid] &&
        po_object.translations[''][msgid]['msgstr'].length ===
          entry['msgstr'].length
      ) {
        // Optionally, fallback to default context
        new_po_object.translations[ctxt][msgid]['msgstr'] = [
          ...po_object.translations[''][msgid]['msgstr'],
        ];

        // Set/add fuzzy flag comment
        new_po_object.translations[ctxt][msgid].comments = {
          ...(new_po_object.translations[ctxt][msgid]?.comments ?? {}),
          flag: [
            'fuzzy',
            new_po_object.translations[ctxt][msgid]?.comments?.flag,
          ]
            .filter((v) => v)
            .join(', '),
        };

        // Set translator comment to flag re-usage in case of deprecation
        // NOTE: comment set on PO object, so it's only included if appended as deprecated.
        po_object.translations[''][msgid].comments = {
          ...(po_object.translations[''][msgid]?.comments ?? {}),
          translator: [
            `NOTE: re-used for same message, but with context '${ctxt}'`,
            po_object.translations[''][msgid]?.comments?.translator,
          ]
            .filter((v) => v)
            .join('\n'),
        };
      }
    }
  }

  if (options.appendNonIncludedFromPO) {
    // Append all strings from PO that are not present in POT
    for (const [ctxt, entries] of Object.entries(po_object.translations)) {
      // Add context
      if (!new_po_object.translations[ctxt]) {
        new_po_object.translations[ctxt] = {};
      }

      for (const [msgid, entry] of Object.entries(entries)) {
        // Add entry
        if (!new_po_object.translations[ctxt][msgid]) {
          new_po_object.translations[ctxt][msgid] = entry;

          // Add translator comment "DEPRECATED"
          new_po_object.translations[ctxt][msgid].comments = {
            ...(new_po_object.translations[ctxt][msgid]?.comments ?? {}),
            ...(new_po_object.translations[ctxt][msgid]?.comments?.translator &&
            entry?.comments?.translator.match(/^DEPRECATED$/gm)
              ? {}
              : {
                  translator: isString(
                    new_po_object.translations[ctxt][msgid]?.comments
                      ?.translator
                  )
                    ? 'DEPRECATED\n' +
                      (new_po_object.translations[ctxt][msgid].comments
                        ?.translator ?? '')
                    : 'DEPRECATED',
                }),
          };
        }
      }
    }
  }

  if (options.includePORevisionDate) {
    const d = new Date();
    const po_rev_date_string = [
      `${d.getUTCFullYear()}`,
      `-${String(d.getUTCMonth() + 1).padStart(2, '0')}`,
      `-${String(d.getUTCDate()).padStart(2, '0')}`,
      ` ${String(d.getUTCHours()).padStart(2, '0')}`,
      `:${String(d.getUTCMinutes()).padStart(2, '0')}`,
      '+0000',
    ].join('');
    new_po_object.headers['po-revision-date'] = po_rev_date_string;
  }

  if (options.includeGenerator) {
    new_po_object.headers[
      'X-Generator'
    ] = `${packageJSON.name}/${packageJSON.version}`;
  }

  return new_po_object;
};

/**
 * Compiles PO object to content.
 *
 * Also sorts the translation string by reference file and line number.
 * Optional deprecated strings are sorted at the end of the file.
 *
 * @param  {object} new_po_object
 * @param  {object} options
 *
 * @return {string} Compiled PO file content
 */
const compilePO = (
  new_po_object: PoObject,
  options: ResolvedOptions
): Buffer => {
  return gettextParser.po.compile(new_po_object, {
    foldLength: options.wrapLength,
    // Sort entries by first reference filepath and line number.
    sort: (a, b) => {
      // Entries with DEPRECATED translator comment are put last (but sorted as usual there).
      const b_deprecated = b.comments?.translator?.match(/^DEPRECATED$/gm);
      const a_deprecated = a.comments?.translator?.match(/^DEPRECATED$/gm);
      if (!a_deprecated && b_deprecated) return -1;
      if (a_deprecated && !b_deprecated) return 1;

      // Entries without reference(s) are put last.
      if (!b.comments?.reference) return -1;
      if (!a.comments?.reference) return 1;

      a = a.comments.reference.trim().split(/\s+/)[0];
      b = b.comments.reference.trim().split(/\s+/)[0];
      return pathLineSort(a, b);
    },
  });
};

/**
 * Writes PO content to file.
 *
 * If needed, creates the containing directory as well.
 *
 * @param  {string} new_po_filepath
 * @param  {string} new_po_output
 *
 * @return {void}
 */
const writePO = (new_po_filepath: string, new_po_output: Buffer) => {
  const new_po_dir = dirname(new_po_filepath);
  if (!existsSync(new_po_dir)) {
    mkdirSync(new_po_dir, { recursive: true });
  }
  writeFileSync(new_po_filepath, new_po_output.toString());
};

/**
 * Log results to console.
 *
 * Optionally, logs input and output PO files per processed POT file.
 *
 * @param  {array} pots    POT filepaths
 * @param  {array} pos_in  Array of arrays with source PO filepaths
 * @param  {array} pos_out Array of arrays with output PO filepaths
 * @param  {string} dest   Destination directory path (for writing files)
 *
 * @return {void}
 */
export const logResults = (pots, pos_in, pos_out, dest) => {
  pots.forEach((pot, i) => {
    const pot_filepath = basename(pot);
    const po_filepaths_in = pos_in[i]?.map((po) => po);
    const po_filepaths_out = pos_out[i]?.map((po) => po.path);
    const max_length_in = po_filepaths_in.reduce(
      (p, c) => Math.max(c.length, p),
      0
    );

    console.log('');

    if (po_filepaths_out && po_filepaths_out.length) {
      console.log(`  ${c.bold.green('■')} ${c.white(pot_filepath)}`);

      po_filepaths_out.forEach((po_filepath_out, pi) => {
        console.log(
          [
            '    ',
            `${c.cyan(po_filepaths_in[pi].padEnd(max_length_in, ' '))}`,
            ` ${c.gray('—►')} `,
            `${c.yellow(dest)}${c.yellow(po_filepath_out)}`,
          ].join('')
        );
      });
    } else {
      console.log(`  ${c.gray('■')} ${c.white(pot_filepath)}`);
      console.log(`    ${c.gray('No PO files found.')}`);
    }
  });
  console.log('');
};
