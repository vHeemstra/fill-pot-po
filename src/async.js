'use strict';

const PluginError = require('./plugin-error');
const c = require('ansi-colors');
c.enabled = require('color-support').hasBasic;

const Vinyl = require('vinyl');
const fs = require('fs');
const gettextParser = require('gettext-parser');

const prepareOptions = require('./options');
const {
  resolvePOTFilepaths,
  getPOFilepaths,
  generatePO,
  logResults,
} = require('./shared');

let pot_input_files = [];
let po_input_files = [];

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
function parsePO(po_filepath, resolve, reject) {
  // Async - Read, parse and process PO file
  fs.readFile(po_filepath, (err, file_content) => {
    if (err) reject(err);
    const po_object = gettextParser.po.parse(file_content);
    resolve(po_object);
  });
}

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
function processPOT(pot_file, options, resolve, reject) {
  const isVinyl = Vinyl.isVinyl(pot_file);
  const pot_filepath = isVinyl ? pot_file.path : pot_file;

  // Get filepaths of POs
  const po_filepaths = getPOFilepaths(pot_filepath, options);

  if (po_filepaths.length) {
    if (isVinyl) {
      if (options.returnPOT) {
        pot_input_files.push(pot_file);
      }

      const pot_object = gettextParser.po.parse(pot_file.contents);
      resolve([pot_object, po_filepaths]);
    } else {
      // Async - Read and parse POT file
      fs.readFile(pot_filepath, (err, pot_content) => {
        if (err) reject(err);

        if (options.returnPOT) {
          pot_input_files.push(
            new Vinyl({
              contents: Buffer.from(pot_content),
              path: pot_filepath,
            })
          );
        }

        const pot_object = gettextParser.po.parse(pot_content);
        resolve([pot_object, po_filepaths]);
      });
    }
  } else {
    resolve(null);
  }
}

function fillPotPo(cb, options) {
  if (typeof cb !== 'function') {
    throw new PluginError(
      'fillPotPo() requires a callback function as first parameter'
    );
  }

  // Set options
  try {
    options = prepareOptions(options);
    options = resolvePOTFilepaths(options);
  } catch (error) {
    cb([false, error.toString()]);
    return;
  }

  // Reset
  pot_input_files = [];
  po_input_files = [];

  // Process all POT files
  Promise.all(
    options.potSources.map((pot_file) => {
      const pot_filepath = Vinyl.isVinyl(pot_file)
        ? pot_file.relative
        : pot_file;

      return new Promise((resolve, reject) => {
        processPOT(pot_file, options, resolve, reject);
      })
        .then(async (value) => {
          if (!value) {
            po_input_files.push([]);
            return [];
          }

          // Process all PO files
          let pot_object = value[0];
          let po_files = value[1];
          po_input_files.push(po_files);
          const po_results = await Promise.all(
            po_files.map((po_file) => {
              return new Promise((resolve, reject) => {
                parsePO(po_file, resolve, reject);
              })
                .then((po_object) => {
                  // Generate PO and add to collection
                  return generatePO(pot_object, po_object, po_file, options);
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
      if (options.logResults) {
        logResults(
          options._potFilenames,
          po_input_files,
          po_output_files,
          options.destDir
        );
      }

      if (options.returnPOT) {
        cb([true, pot_input_files]);
        return;
      }

      // Flatten into array with all PO files
      po_output_files = [].concat(...po_output_files);
      cb([true, po_output_files]);
    })
    .catch((error) => {
      cb([false, error.toString()]);
    });

  return;
}

module.exports = fillPotPo;
