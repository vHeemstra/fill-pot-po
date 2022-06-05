'use strict';

const Vinyl = require('vinyl');
const { readFileSync } = require('fs');
const gettextParser = require('gettext-parser');

const prepareOptions = require('./options');
const { resolvePOTFilepaths, getPOFilepaths, generatePO, logResults } = require('./shared');

let pot_input_files = [];
let po_input_files = [];
let po_output_files = [];

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
function processPOs(po_filepaths, pot_object, options) {
	const pos = [];
	// Parse PO files
	for (const po_filepath of po_filepaths) {
		// Sync - Read and parse PO file
		const po_content = readFileSync(po_filepath).toString();
		const po_object = gettextParser.po.parse(po_content);

		// Generate PO and add to collection
		pos.push( generatePO(pot_object, po_object, po_filepath, options) );
	}
	po_output_files.push(pos);
}

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
function processPOT(pot_file, options) {
	const isVinyl = Vinyl.isVinyl(pot_file);
	const pot_filepath = isVinyl ? pot_file.path : pot_file;

	// Get filepaths of POs
	const po_filepaths = getPOFilepaths(pot_filepath, options);
	po_input_files.push(po_filepaths);

	if (po_filepaths.length) {
		let pot_content = '';
		if (isVinyl) {
			if (options.returnPOT) {
				pot_input_files.push(pot_file);
			}

			pot_content = pot_file.contents;
		} else {
			// Sync - Read POT file
			pot_content = readFileSync(pot_filepath);

			if (options.returnPOT) {
				pot_input_files.push(new Vinyl({
					contents: Buffer.from(pot_content),
					path: pot_filepath
				}));
			}

			pot_content = pot_content.toString();
		}
		const pot_object = gettextParser.po.parse(pot_content);
		processPOs(po_filepaths, pot_object, options);
	} else {
		po_output_files.push([]);
	}
}

function fillPotPoSync(options) {
	// Reset
	po_output_files = [];

	// Set options
	options = prepareOptions(options);
	options = resolvePOTFilepaths(options);

	// Process all POT files
	options.potSources.forEach(pot_file => {
		processPOT(pot_file, options);
	});

	if (options.logResults) {
		logResults(options._potFilenames, po_input_files, po_output_files, options.destDir);
	}

	if (options.returnPOT) {
		return pot_input_files;
	}

	// Flatten into array with all PO files
	po_output_files = [].concat(...po_output_files);
	return po_output_files;
}

module.exports = fillPotPoSync;
