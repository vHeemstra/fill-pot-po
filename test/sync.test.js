'use strict';

const fillPotPo = require('../src/sync');
const { testOptions } = require('../src/index');

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
			...testOptions,
			potSources: [ potSource ],
			srcDir: input_dir,
			writeFiles: false,
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
			...testOptions,
			potSources: [ potSource ],
			srcDir: input_dir,
			domainInPOPath: false,
			writeFiles: false,
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
			...testOptions,
			potSources: [ potSource ],
			poSources: [ poSources ],
			srcDir: input_dir,
			writeFiles: false,
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
			...testOptions,
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
			...testOptions,
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
			...testOptions,
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
		// Mock the console.log function
		const consoleSpy = jest.spyOn(console, 'log')
			.mockName('console.log')
			.mockImplementation((...args) => {
				return args.map(v => String(v).trim().replaceAll(/\s+/g, ' ')).join(' ');
			});

		const options = {
			...testOptions,
			potSources: [ potSource ],
			poSources: [],
			srcDir: input_dir,
			writeFiles: false,
			logResults: true,
		};

		// Errorless execution
		let result;
		expect(() => {
			result = fillPotPo(options);
		}).not.toThrow();

		// Check returned array
		expect(result).toHaveLength(0);

		// Check if results were logged
		expect(consoleSpy).toHaveBeenCalledTimes(4);
		const logs = consoleSpy.mock.results.slice();
		expect(logs[0].value + logs[3].value).toEqual('');
		expect(logs[1].value).toMatch(new RegExp('■ ' + potSource.split('/').slice(-1)[0]));
		expect(logs[2].value).toMatch(new RegExp('No PO files found.'));

		// Restore the console.log function
		consoleSpy.mockRestore();
	});

	test('auto domain PO - write - return POT', () => {
		folder_i++;
		let folder_path = `${test_dir}${folder_i}`;
		if (!existsSync(folder_path)) {
			mkdirSync(folder_path, {recursive: true});
		}

		const options = {
			...testOptions,
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

	test('auto domain PO - write - input POT Vinyl', () => {
		const options = {
			...testOptions,
			potSources: new Vinyl({
				contents: pot_source_buffer,
				path: potSource,
			}),
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

		// Check contents
		expect(
			result[0].contents
				.equals(expected_po_domain)
		).toBe(true);
	});

	test('auto domain PO - write - return POT - input POT Vinyl', () => {
		folder_i++;
		let folder_path = `${test_dir}${folder_i}`;
		if (!existsSync(folder_path)) {
			mkdirSync(folder_path, {recursive: true});
		}

		const options = {
			...testOptions,
			potSources: new Vinyl({
				contents: pot_source_buffer,
				path: potSource,
			}),
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

	test('extras - auto domain PO - write - content optionals', () => {
		folder_i++;
		let folder_path = `${test_dir}${folder_i}`;

		// Mock the console.log function
		const consoleSpy = jest.spyOn(console, 'log')
			.mockName('console.log')
			.mockImplementation((...args) => {
				return args.map(v => String(v).trim().replaceAll(/\s+/g, ' ')).join(' ');
			});

		const options = {
			...testOptions,
			potSources: [ potSource ],
			srcDir: input_dir,
			writeFiles: true,
			destDir: folder_path,
			logResults: true,
			appendNonIncludedFromPO: false,
			includePORevisionDate: true,
			includeGenerator: true,
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

		// Check if folder and file exist
		expect(existsSync(folder_path)).toBe(true);
		const files = matchedSync([`${folder_path}/*`]);
		expect(files).toHaveLength(1);
		expect(files).toEqual([
			`${folder_path}/text-domain-nl_NL.po`
		]);

		// Check contents
		const result_string_content = result[0].contents.toString();
		expect(result_string_content)
			.not.toMatch(/^# DEPRECATED$/m);
		expect(result_string_content)
			.toMatch(/^"PO-Revision-Date: \d{4}-\d{2}-\d{2} \d{2}:\d{2}\+0000\\n"$/m);
		expect(result_string_content)
			.toMatch(/^"X-Generator: fill-pot-po\/\d+\.\d+\.\d+\\n"$/m);

		// Check if results were logged
		expect(consoleSpy).toHaveBeenCalledTimes(4);
		const logs = consoleSpy.mock.results.slice();
		expect(logs[0].value + logs[3].value).toEqual('');
		expect(logs[1].value)
			.toMatch(new RegExp('■ ' + potSource.split('/').slice(-1)[0]));
		expect(logs[2].value)
			.toMatch(new RegExp(`${input_dir}text-domain-nl_NL.po —► ${folder_path}/text-domain-nl_NL.po`));

		// Restore the console.log function
		consoleSpy.mockRestore();
	});
});

// TODO? potSources: Vinyl or Array-of
// TODO? multiple POT files?
