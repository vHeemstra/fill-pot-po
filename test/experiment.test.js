'use strict';

/* eslint-disable */

const { sync: matchedSync } = require('matched');
const { rmSync, existsSync, mkdirSync, readFileSync } = require('fs');
const { relative, resolve } = require('path');

const potSource = './test/examples/text-domain.pot';
// const potSources = './test/examples/*.pot';
const poSources = './test/examples/input/*.po';
// const poSource = './test/examples/input/nl_NL.po';
const input_dir = 'test/examples/input/';
const expected_dir = 'test/examples/output_correct/';
const test_dir = 'test/examples/output/fs';

describe('matchedSync rel path', () => {
	test('produces list', () => {
		const test1 = matchedSync('./test/examples/input/*.po');
		expect(test1).toHaveLength(2);
	});

	test('produces list2', () => {
		const test1 = matchedSync('./test/examples/**/*.po');
		expect(test1).toHaveLength(4);
	});

	test('produces list3', () => {
		const test1 = matchedSync('./test/examples/**/*.*');
		expect(test1).toHaveLength(6);
	});
});

describe('matchedSync rel path2', () => {
	test('matchedSync produces list', () => {
		const test1 = matchedSync('test/examples/input/*.po');
		expect(test1).toHaveLength(2);
	});

	test('matchedSync produces list2', () => {
		const test1 = matchedSync('test/examples/**/*.po');
		expect(test1).toHaveLength(4);
	});

	test('matchedSync produces list3', () => {
		const test1 = matchedSync('test/examples/**/*.*');
		expect(test1).toHaveLength(6);
	});
});
