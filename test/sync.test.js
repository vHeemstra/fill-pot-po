'use strict';

const fillPotPo = require('../src/sync');

const { sync: matchedSync } = require('matched');
const { rmSync, existsSync, mkdirSync, readFileSync } = require('fs');
const { relative } = require('path');
const Vinyl = require('vinyl');

const potSource = './test/examples/text-domain.pot';
// const potSources = './test/examples/*.pot';
const poSources = './test/examples/input/*.po';
// const poSource = './test/examples/input/nl_NL.po';
const input_dir = 'test/examples/input/';
const expected_dir = 'test/examples/output_correct/';
const test_dir = 'test/examples/output/fs';

const pot_source_buffer = readFileSync(potSource);
const expected_po_domain = readFileSync(`${expected_dir}text-domain-nl_NL.po`);
const expected_po_no_domain = readFileSync(`${expected_dir}nl_NL.po`);

// Default options used when check files were generated
const shared_options = {
	wrapLength: 77,
	defaultContextAsFallback: true,
	appendNonIncludedFromPO: true,
	includePORevisionDate: false,
	includeGenerator: false,
};

/**
 * Delete all temporary testing folders and files.
 *
 * @return {void}
 */
function clearOutputFolder() {
	let files = matchedSync([
		`${test_dir}*`,
	]);
	files.sort((a, b) => {
		const a_len = a.split(/\//);
		const b_len = b.split(/\//);
		return b_len - a_len;
	});
	for (const file of files) {
		rmSync(file, {recursive: true});
	}
}

beforeAll(() => {
	clearOutputFolder();
});

afterAll(() => {
	clearOutputFolder();
});

describe('sync.js - single POT', () => {

	let folder_i = 0;

	test('auto domain PO - no write', () => {
		folder_i++;
		let folder_path = `${test_dir}${folder_i}`;
		if (!existsSync(folder_path)) {
			mkdirSync(folder_path, {recursive: true});
		}

		const options = {
			...shared_options,
			potSources: [ potSource ],
			srcDir: input_dir,
			writeFiles: false,
		};

		// Errorless execution
		let result;
		expect(() => {
			result = fillPotPo(options);
		}).not.toThrow();

		// Check returned array
		expect(result).toHaveLength(1);
		expect(result[0]).toBeInstanceOf(Vinyl);
		expect(result[0].isBuffer()).toBe(true);
		expect(result[0].path).toEqual('text-domain-nl_NL.po');

		// Check that no files were created
		const files = matchedSync([`${folder_path}/*`]);
		expect(files).toHaveLength(0);

		// Check contents
		expect(
			result[0].contents
				.equals(expected_po_domain)
		).toBe(true);
	});

	test('auto no-domain PO - no write', () => {
		folder_i++;
		let folder_path = `${test_dir}${folder_i}`;
		if (!existsSync(folder_path)) {
			mkdirSync(folder_path, {recursive: true});
		}

		const options = {
			...shared_options,
			potSources: [ potSource ],
			srcDir: input_dir,
			domainInPOPath: false,
			writeFiles: false,
		};

		// Errorless execution
		let result;
		expect(() => {
			result = fillPotPo(options);
		}).not.toThrow();

		// Check returned array
		expect(result).toHaveLength(1);
		expect(result[0]).toBeInstanceOf(Vinyl);
		expect(result[0].isBuffer()).toBe(true);
		expect(result[0].path).toEqual('nl_NL.po');

		// Check that no files were created
		const files = matchedSync([`${folder_path}/*`]);
		expect(files).toHaveLength(0);

		// Check contents
		expect(
			result[0].contents
				.equals(expected_po_no_domain)
		).toBe(true);
	});

	test('manual multiple PO - no write', () => {
		folder_i++;
		let folder_path = `${test_dir}${folder_i}`;
		if (!existsSync(folder_path)) {
			mkdirSync(folder_path, {recursive: true});
		}

		const options = {
			...shared_options,
			potSources: [ potSource ],
			poSources: [ poSources ],
			srcDir: input_dir,
			writeFiles: false,
		};

		// Errorless execution
		let result;
		expect(() => {
			result = fillPotPo(options);
		}).not.toThrow();

		// Check returned array
		expect(result).toHaveLength(2);
		expect(result[0]).toBeInstanceOf(Vinyl);
		expect(result[0].isBuffer()).toBe(true);
		expect(result[0].path).toEqual('nl_NL.po');
		expect(result[1]).toBeInstanceOf(Vinyl);
		expect(result[1].isBuffer()).toBe(true);
		expect(result[1].path).toEqual('text-domain-nl_NL.po');

		// Check that no files were created
		const files = matchedSync([`${folder_path}/*`]);
		expect(files).toHaveLength(0);

		// Check contents
		expect(
			result[0].contents
				.equals(expected_po_no_domain)
		).toBe(true);
		expect(
			result[1].contents
				.equals(expected_po_domain)
		).toBe(true);
	});

	test('auto domain PO - write', () => {
		folder_i++;
		let folder_path = `${test_dir}${folder_i}`;
		if (!existsSync(folder_path)) {
			mkdirSync(folder_path, {recursive: true});
		}

		const options = {
			...shared_options,
			potSources: [ potSource ],
			srcDir: input_dir,
			writeFiles: true,
			destDir: folder_path,
		};

		// Errorless execution
		let result;
		expect(() => {
			result = fillPotPo(options);
		}).not.toThrow();

		// Check returned array
		expect(result).toHaveLength(1);
		expect(result[0]).toBeInstanceOf(Vinyl);
		expect(result[0].isBuffer()).toBe(true);
		expect(result[0].path).toEqual('text-domain-nl_NL.po');

		// Check if file exist
		const files = matchedSync([`${folder_path}/*`]);
		expect(files).toHaveLength(1);
		expect(files).toEqual([
			`${folder_path}/text-domain-nl_NL.po`
		]);

		// Check contents of file
		expect(
			readFileSync(`${folder_path}/text-domain-nl_NL.po`)
				.equals(expected_po_domain)
		).toBe(true);
	});

	test('auto no-domain PO - write', () => {
		folder_i++;
		let folder_path = `${test_dir}${folder_i}`;
		if (!existsSync(folder_path)) {
			mkdirSync(folder_path, {recursive: true});
		}

		const options = {
			...shared_options,
			potSources: [ potSource ],
			srcDir: input_dir,
			domainInPOPath: false,
			writeFiles: true,
			destDir: folder_path,
		};

		// Errorless execution
		let result;
		expect(() => {
			result = fillPotPo(options);
		}).not.toThrow();

		// Check returned array
		expect(result).toHaveLength(1);
		expect(result[0]).toBeInstanceOf(Vinyl);
		expect(result[0].isBuffer()).toBe(true);
		expect(result[0].path).toEqual('nl_NL.po');

		// Check if file exist
		const files = matchedSync([`${folder_path}/*`]);
		expect(files).toHaveLength(1);
		expect(files).toEqual([
			`${folder_path}/nl_NL.po`
		]);

		// Check contents of file
		expect(
			readFileSync(`${folder_path}/nl_NL.po`)
				.equals(expected_po_no_domain)
		).toBe(true);
	});

	test('manual multiple PO - write', () => {
		folder_i++;
		let folder_path = `${test_dir}${folder_i}`;
		if (!existsSync(folder_path)) {
			mkdirSync(folder_path, {recursive: true});
		}

		const options = {
			...shared_options,
			potSources: [ potSource ],
			poSources: [ poSources ],
			srcDir: input_dir,
			writeFiles: true,
			destDir: folder_path,
		};

		// Errorless execution
		let result;
		expect(() => {
			result = fillPotPo(options);
		}).not.toThrow();

		// Check returned array
		expect(result).toHaveLength(2);
		expect(result[0]).toBeInstanceOf(Vinyl);
		expect(result[0].isBuffer()).toBe(true);
		expect(result[0].path).toEqual('nl_NL.po');
		expect(result[1]).toBeInstanceOf(Vinyl);
		expect(result[1].isBuffer()).toBe(true);
		expect(result[1].path).toEqual('text-domain-nl_NL.po');

		// Check if files exist
		const files = matchedSync([`${folder_path}/*`]);
		expect(files).toEqual([
			`${folder_path}/nl_NL.po`,
			`${folder_path}/text-domain-nl_NL.po`,
		]);

		// Check contents of files
		expect(
			readFileSync(`${folder_path}/nl_NL.po`)
				.equals(expected_po_no_domain)
		).toBe(true);
		expect(
			readFileSync(`${folder_path}/text-domain-nl_NL.po`)
				.equals(expected_po_domain)
		).toBe(true);
	});

	test('manual empty PO array', () => {
		folder_i++;
		let folder_path = `${test_dir}${folder_i}`;
		if (!existsSync(folder_path)) {
			mkdirSync(folder_path, {recursive: true});
		}

		const options = {
			...shared_options,
			potSources: [ potSource ],
			poSources: [],
			srcDir: input_dir,
			writeFiles: false,
		};

		// Errorless execution
		let result;
		expect(() => {
			result = fillPotPo(options);
		}).not.toThrow();

		// Check returned array
		expect(result).toHaveLength(0);

		// Check that no files were created
		const files = matchedSync([`${folder_path}/*`]);
		expect(files).toHaveLength(0);
	});

	test('auto domain PO - write - return POT', () => {
		folder_i++;
		let folder_path = `${test_dir}${folder_i}`;
		if (!existsSync(folder_path)) {
			mkdirSync(folder_path, {recursive: true});
		}

		const options = {
			...shared_options,
			potSources: [ potSource ],
			srcDir: input_dir,
			returnPOT: true,
			writeFiles: true,
			destDir: folder_path,
		};

		// Errorless execution
		let result;
		expect(() => {
			result = fillPotPo(options);
		}).not.toThrow();

		// Check returned array
		expect(result).toHaveLength(1);
		expect(result[0]).toBeInstanceOf(Vinyl);
		expect(result[0].isBuffer()).toBe(true);
		expect(relative(result[0].path, potSource)).toEqual('');

		// Check contents
		expect(
			result[0].contents
				.equals(pot_source_buffer)
		).toBe(true);

		// Check if file exist
		const files = matchedSync([`${folder_path}/*`]);
		expect(files).toHaveLength(1);
		expect(files).toEqual([
			`${folder_path}/text-domain-nl_NL.po`
		]);

		// Check contents of file
		expect(
			readFileSync(`${folder_path}/text-domain-nl_NL.po`)
				.equals(expected_po_domain)
		).toBe(true);
	});

});

// TODO? potSources: Vinyl or Array-of
// TODO? multiple POT files?
