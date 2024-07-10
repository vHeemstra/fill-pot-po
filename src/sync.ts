import * as fs from 'node:fs';
// import { Buffer } from 'node:buffer';
import Vinyl from 'vinyl';
import gettextParser from 'gettext-parser';

import prepareOptions from './options.js';
import {
  resolvePOTFilepaths,
  getPOFilepaths,
  generatePO,
  logResults,
  Options,
  Source,
  ResolvedOptions,
  PoObject,
} from './shared.js';

let pot_input_files: Vinyl[] = [];
let po_input_files: string[][] = [];
let po_output_files: Vinyl[][] = [];

/**
 * Process all PO files for POT file.
 *
 * - Reads and parses each PO file
 * - Generates new PO file
 * - Adds result to collection
 *
 * @param  {array} po_filepaths
 * @param  {object} pot_object
 * @param  {object} options
 *
 * @return {void}
 */
export const processPOs = (
  po_filepaths: string[],
  pot_object: PoObject,
  options: ResolvedOptions
) => {
  const pos: Vinyl[] = [];
  // Parse PO files
  for (const po_filepath of po_filepaths) {
    // Sync - Read and parse PO file
    const po_content = fs.readFileSync(po_filepath).toString();
    const po_object: PoObject = gettextParser.po.parse(po_content);

    // Generate PO and add to collection
    pos.push(generatePO(pot_object, po_object, po_filepath, options));
  }
  po_output_files.push(pos);
};

/**
 * Process POT file.
 *
 * - Finds the PO filepaths
 * - Reads and parses the POT file
 * - Process all PO files
 *
 * @param  {string} pot_filepath
 * @param  {object} options
 *
 * @return {void}
 */
export const processPOT = (pot_file: Source, options: ResolvedOptions) => {
  const isVinyl = Vinyl.isVinyl(pot_file);
  const pot_filepath: string = isVinyl ? pot_file.path : pot_file;

  // Get filepaths of POs
  const po_filepaths = getPOFilepaths(pot_filepath, options);
  po_input_files.push(po_filepaths);

  if (po_filepaths.length) {
    let pot_content: string = '';
    if (isVinyl) {
      if (options.returnPOT) {
        pot_input_files.push(pot_file);
      }

      pot_content = pot_file.contents.toString();
    } else {
      // Sync - Read POT file
      const pot_content_buffer = fs.readFileSync(pot_filepath);
      pot_content = pot_content_buffer.toString();

      if (options.returnPOT) {
        pot_input_files.push(
          new Vinyl({
            contents: pot_content_buffer,
            path: pot_filepath,
          })
        );
      }
    }
    const pot_object: PoObject = gettextParser.po.parse(pot_content);
    processPOs(po_filepaths, pot_object, options);
  } else {
    po_output_files.push([]);
  }
};

export default (options: Options): Vinyl[] => {
  // Reset
  pot_input_files = [];
  po_input_files = [];
  po_output_files = [];

  // Set options
  const resolvedOptions = resolvePOTFilepaths(prepareOptions(options));

  // Process all POT files
  resolvedOptions.potSources.forEach((pot_file) => {
    processPOT(pot_file, resolvedOptions);
  });

  if (resolvedOptions.logResults) {
    logResults(
      resolvedOptions._potFilenames,
      po_input_files,
      po_output_files,
      resolvedOptions.destDir
    );
  }

  if (resolvedOptions.returnPOT) {
    return pot_input_files;
  }

  // Flatten into array with all PO files
  return ([] as Vinyl[]).concat(...po_output_files);
};
