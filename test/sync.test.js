'use strict';

const fillPotPo = require('../src/sync');

const { sync: matchedSync } = require('matched');
const { rmSync, existsSync, mkdirSync, readFileSync } = require('fs');

const test_dir = 'test/examples/output/fs';

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

const potSource = './test/examples/text-domain.pot';
// const potSources = './test/examples/*.pot';
const poSources = './test/examples/input/*.po';
// const poSource = './test/examples/input/nl_NL.po';

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
			potSources: [ potSource ],
			srcDir: './test/examples/input/', // Only used for auto-find POs. Default is POT file directory.
			destDir: folder_path,
			writeFiles: false,
			defaultContextAsFallback: true,
			appendNonIncludedFromPO: true,
			includePORevisionDate: false,
			includeGenerator: false,
		};

		// Errorless execution
		let result;
		expect(() => {
			result = fillPotPo(options);
		}).not.toThrow();

		expect(result).toHaveLength(1);
		expect(result[0]).toHaveLength(2);
		expect(result[0][0]).toEqual('text-domain-nl_NL.po');
		expect(result[0][1]).toBeInstanceOf(Buffer);
		const files = matchedSync([folder_path + '/*']);
		expect(files).toHaveLength(0);

		// Check contents
		expect(result[0][1])
			.toEqual(readFileSync('test/examples/output_correct/text-domain-nl_NL.po'));
	});

	test('auto no-domain PO - no write', () => {
		folder_i++;
		let folder_path = `${test_dir}${folder_i}`;
		if (!existsSync(folder_path)) {
			mkdirSync(folder_path, {recursive: true});
		}

		const options = {
			potSources: [ potSource ],
			srcDir: './test/examples/input/', // Only used for auto-find POs. Default is POT file directory.
			destDir: folder_path,
			writeFiles: false,
			domainInPOPath: false,
			defaultContextAsFallback: true,
			appendNonIncludedFromPO: true,
			includePORevisionDate: false,
			includeGenerator: false,
		};

		// Errorless execution
		let result;
		expect(() => {
			result = fillPotPo(options);
		}).not.toThrow();

		expect(result).toHaveLength(1);
		expect(result[0]).toHaveLength(2);
		expect(result[0][0]).toEqual('nl_NL.po');
		expect(result[0][1]).toBeInstanceOf(Buffer);
		const files = matchedSync([folder_path + '/*']);
		expect(files).toHaveLength(0);

		// Check contents
		expect(result[0][1])
			.toEqual(readFileSync('test/examples/output_correct/nl_NL.po'));
	});

	test('manual multiple PO - no write', () => {
		folder_i++;
		let folder_path = `${test_dir}${folder_i}`;
		if (!existsSync(folder_path)) {
			mkdirSync(folder_path, {recursive: true});
		}

		const options = {
			potSources: [ potSource ],
			poSources: [ poSources ],
			srcDir: './test/examples/input/', // Only used for auto-find POs. Default is POT file directory.
			destDir: folder_path,
			writeFiles: false,
			defaultContextAsFallback: true,
			appendNonIncludedFromPO: true,
			includePORevisionDate: false,
			includeGenerator: false,
		};

		// Errorless execution
		let result;
		expect(() => {
			result = fillPotPo(options);
		}).not.toThrow();

		expect(result).toHaveLength(2);
		expect(result[0]).toHaveLength(2);
		expect(result[0][0]).toEqual('nl_NL.po');
		expect(result[0][1]).toBeInstanceOf(Buffer);
		expect(result[1]).toHaveLength(2);
		expect(result[1][0]).toEqual('text-domain-nl_NL.po');
		expect(result[1][1]).toBeInstanceOf(Buffer);
		const files = matchedSync([folder_path + '/*']);
		expect(files).toHaveLength(0);

		// Check contents
		expect(result[0][1])
			.toEqual(readFileSync('test/examples/output_correct/nl_NL.po'));
		expect(result[1][1])
			.toEqual(readFileSync('test/examples/output_correct/text-domain-nl_NL.po'));
	});

	test('auto domain PO - write', () => {
		folder_i++;
		let folder_path = `${test_dir}${folder_i}`;
		if (!existsSync(folder_path)) {
			mkdirSync(folder_path, {recursive: true});
		}

		const options = {
			potSources: [ potSource ],
			srcDir: './test/examples/input/', // Only used for auto-find POs. Default is POT file directory.
			destDir: folder_path,
			defaultContextAsFallback: true,
			appendNonIncludedFromPO: true,
			includePORevisionDate: false,
			includeGenerator: false,
		};

		// Errorless execution
		let result;
		expect(() => {
			result = fillPotPo(options);
		}).not.toThrow();

		// Check returned array
		expect(result).toHaveLength(1);
		expect(result[0]).toHaveLength(2);
		expect(result[0][0]).toEqual('text-domain-nl_NL.po');
		expect(result[0][1]).toBeInstanceOf(Buffer);

		// Check if file exist
		const files = matchedSync([folder_path + '/*']);
		expect(files).toHaveLength(1);
		expect(files).toEqual([
			folder_path + '/text-domain-nl_NL.po'
		]);

		// Check contents of file
		expect(readFileSync(folder_path + '/text-domain-nl_NL.po', 'utf-8'))
			.toEqual(readFileSync('test/examples/output_correct/text-domain-nl_NL.po', 'utf-8'));
	});

	test('auto no-domain PO - write', () => {
		folder_i++;
		let folder_path = `${test_dir}${folder_i}`;
		if (!existsSync(folder_path)) {
			mkdirSync(folder_path, {recursive: true});
		}

		const options = {
			potSources: [ potSource ],
			srcDir: './test/examples/input/', // Only used for auto-find POs. Default is POT file directory.
			destDir: folder_path,
			domainInPOPath: false,
			defaultContextAsFallback: true,
			appendNonIncludedFromPO: true,
			includePORevisionDate: false,
			includeGenerator: false,
		};

		// Errorless execution
		let result;
		expect(() => {
			result = fillPotPo(options);
		}).not.toThrow();

		// Check returned array
		expect(result).toHaveLength(1);
		expect(result[0]).toHaveLength(2);
		expect(result[0][0]).toEqual('nl_NL.po');
		expect(result[0][1]).toBeInstanceOf(Buffer);

		// Check if file exist
		const files = matchedSync([folder_path + '/*']);
		expect(files).toHaveLength(1);
		expect(files).toEqual([
			folder_path + '/nl_NL.po'
		]);

		// Check contents of file
		expect(readFileSync(folder_path + '/nl_NL.po', 'utf-8'))
			.toEqual(readFileSync('test/examples/output_correct/nl_NL.po', 'utf-8'));
	});

	test('manual multiple PO - write', () => {
		folder_i++;
		let folder_path = `${test_dir}${folder_i}`;
		if (!existsSync(folder_path)) {
			mkdirSync(folder_path, {recursive: true});
		}

		const options = {
			potSources: [ potSource ],
			poSources: [ poSources ],
			srcDir: './test/examples/input/', // Only used for auto-find POs. Default is POT file directory.
			destDir: folder_path,
			defaultContextAsFallback: true,
			appendNonIncludedFromPO: true,
			includePORevisionDate: false,
			includeGenerator: false,
		};

		// Errorless execution
		let result;
		expect(() => {
			result = fillPotPo(options);
		}).not.toThrow();

		// Check returned array
		expect(result).toHaveLength(2);
		expect(result[0]).toHaveLength(2);
		expect(result[0][0]).toEqual('nl_NL.po');
		expect(result[0][1]).toBeInstanceOf(Buffer);
		expect(result[1]).toHaveLength(2);
		expect(result[1][0]).toEqual('text-domain-nl_NL.po');
		expect(result[1][1]).toBeInstanceOf(Buffer);

		// Check if files exist
		const files = matchedSync([folder_path + '/*']);
		expect(files).toEqual([
			folder_path + '/nl_NL.po',
			folder_path + '/text-domain-nl_NL.po',
		]);

		// Check contents of files
		expect(readFileSync(folder_path + '/nl_NL.po', 'utf-8'))
			.toEqual(readFileSync('test/examples/output_correct/nl_NL.po', 'utf-8'));
		expect(readFileSync(folder_path + '/text-domain-nl_NL.po', 'utf-8'))
			.toEqual(readFileSync('test/examples/output_correct/text-domain-nl_NL.po', 'utf-8'));
	});

});

// TODO: multiple POT files?
