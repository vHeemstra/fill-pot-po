import * as fs from 'node:fs';
import Vinyl from 'vinyl';
import { Buffer } from 'node:buffer';
import gettextParser from 'gettext-parser';
import c from 'ansi-colors';
import cs from 'color-support';

const colorSupport = cs();
/* istanbul ignore next */
c.enabled = colorSupport && colorSupport.hasBasic;

import PluginError from './plugin-error.js';
import prepareOptions from './options.js';
import {
  resolvePOTFilepaths,
  getPOFilepaths,
  generatePO,
  logResults,
  Options,
  ResolvedOptions,
  PoObject,
  Source,
} from './shared.js';

/**
 * Reads and parses PO file.
 *
 * @param  {string}   po_filepath
 * @param  {function} resolve     Resolve callback
 * @param  {function} reject      Reject callback
 *
 * @resolve {object} PO content
 * @reject  {string} File reading error
 *
 * @return {void}
 */
export const parsePO = (
  po_filepath: string,
  resolve: ParsePoResolveCallback,
  reject: ParsePoRejectCallback
) => {
  // Async - Read, parse and process PO file
  fs.readFile(po_filepath, (err, file_content) => {
    if (err) reject(err);
    const po_object = gettextParser.po.parse(file_content);
    resolve(po_object);
  });
};
type ParsePoResolveCallback = (value: PoObject) => void;
type ParsePoRejectCallback = (reason?: NodeJS.ErrnoException) => void;

/**
 * Process POT file.
 *
 * - Finds the PO filepaths
 * - Reads and parses the POT file
 *
 * @param  {string} pot_filepath
 * @param  {object} options
 *
 * @resolve {array} [
 *                    {object} POT content
 *                    {array}  PO filepaths
 *                  ]
 * @reject {string} File reading error
 *
 * @return {void}
 */
export const processPOT = (
  pot_file: Source,
  options: ResolvedOptions,
  resolve: ProcessPotResolveCallback,
  reject: ProcessPotRejectCallback
) => {
  const isVinyl = Vinyl.isVinyl(pot_file);
  const pot_filepath = isVinyl ? pot_file.path : pot_file;

  // Get filepaths of POs
  const po_filepaths = getPOFilepaths(pot_filepath, options);

  if (po_filepaths.length) {
    if (isVinyl) {
      if (options.returnPOT) {
        options._pot_input_files.push(pot_file);
      }

      const pot_object: PoObject = gettextParser.po.parse(
        pot_file.contents as Buffer
      );
      resolve([pot_object, po_filepaths]);
    } else {
      // Async - Read and parse POT file
      fs.readFile(pot_filepath, (err, pot_content) => {
        if (err) reject(err);

        if (options.returnPOT) {
          options._pot_input_files.push(
            new Vinyl({
              contents: Buffer.from(pot_content),
              path: pot_filepath,
            })
          );
        }

        const pot_object: PoObject = gettextParser.po.parse(pot_content);
        resolve([pot_object, po_filepaths]);
      });
    }
  } else {
    resolve(null);
  }
};
type ProcessPotResolveCallback = (value: [PoObject, string[]] | null) => void;
type ProcessPotRejectCallback = (reason?: NodeJS.ErrnoException) => void;

type AsyncCallbackResult = [true, Vinyl[]] | [false, string];
export type AsyncCallback = (result: AsyncCallbackResult) => unknown;
export default (cb: AsyncCallback, options: Options) => {
  if (typeof cb !== 'function') {
    throw new PluginError(
      'fillPotPo() requires a callback function as first parameter'
    );
  }

  // Set options
  let resolvedOptions: ResolvedOptions;
  try {
    resolvedOptions = resolvePOTFilepaths(prepareOptions(options));
  } catch (error) {
    cb([false, error.toString()]);
    return;
  }

  // Reset
  resolvedOptions._pot_input_files = [];
  resolvedOptions._po_input_files = [];

  // Process all POT files
  Promise.all(
    resolvedOptions.potSources.map((pot_file) => {
      const pot_filepath = Vinyl.isVinyl(pot_file)
        ? pot_file.relative
        : pot_file;

      return new Promise(
        (
          resolve: ProcessPotResolveCallback,
          reject: ProcessPotRejectCallback
        ) => {
          processPOT(pot_file, resolvedOptions, resolve, reject);
        }
      )
        .then(async (value) => {
          if (!value) {
            resolvedOptions._po_input_files.push([]);
            return [];
          }

          // Process all PO files
          const pot_object = value[0];
          const po_files: string[] = value[1];
          resolvedOptions._po_input_files.push(po_files);
          const po_results = await Promise.all(
            po_files.map((po_file) => {
              return new Promise(
                (
                  resolve: ParsePoResolveCallback,
                  reject: ParsePoRejectCallback
                ) => {
                  parsePO(po_file, resolve, reject);
                }
              )
                .then((po_object) => {
                  // Generate PO and add to collection
                  return generatePO(
                    pot_object,
                    po_object,
                    po_file,
                    resolvedOptions
                  );
                })
                .catch((error) => {
                  throw new PluginError(
                    `${c.bold(error.message)}  ${c.gray(
                      `(PO ${c.white(po_file)})`
                    )}`
                  );
                });
            })
          );
          return po_results;
        })
        .catch((error) => {
          throw new PluginError(
            `${error.message} ${c.gray(`(POT ${c.white(pot_filepath)})`)}`
          );
        });
    })
  )
    .then((po_output_files) => {
      if (resolvedOptions.logResults) {
        logResults(
          resolvedOptions._potFilenames,
          resolvedOptions._po_input_files,
          po_output_files,
          resolvedOptions.destDir
        );
      }

      if (resolvedOptions.returnPOT) {
        cb([true, resolvedOptions._pot_input_files]);
        return;
      }

      // Flatten into array with all PO files
      cb([true, ([] as Vinyl[]).concat(...po_output_files)]);
    })
    .catch((error) => {
      cb([false, error.toString()]);
    })
    .finally(() => {
      // Clear memory
      resolvedOptions._pot_input_files = [];
      resolvedOptions._po_input_files = [];
    });

  return;
};
