'use strict';

const { resolvePOTFilepaths } = require('../src/shared');
const prepareOptions = require('../src/options');

const potSource = ['./test/examples/text-domain.pot'];

describe('shared.js - logic', () => {
	test('leave poSources empty if multiple potSources', () => {
		const re = new RegExp('leave option poSources empty');
		expect(() => {
			resolvePOTFilepaths(
				prepareOptions({ poSources: '' })
			);
		}).not.toThrow(re);
		expect(() => {
			resolvePOTFilepaths(
				prepareOptions({ poSources: '*.po' })
			);
		}).toThrow(re);
		expect(() => {
			resolvePOTFilepaths(
				prepareOptions({ poSources: ['*.po'] })
			);
		}).toThrow(re);

		expect(() => {
			resolvePOTFilepaths(
				prepareOptions({ potSources: potSource, poSources: '' })
			);
		}).not.toThrow(re);
		expect(() => {
			resolvePOTFilepaths(
				prepareOptions({ potSources: potSource, poSources: '*.po' })
			);
		}).not.toThrow(re);
		expect(() => {
			resolvePOTFilepaths(
				prepareOptions({ potSources: potSource, poSources: ['*.po'] })
			);
		}).not.toThrow(re);
	});

	test('potSources has files to process', () => {
		const re = new RegExp('No POT files found');
		expect(() => {
			resolvePOTFilepaths(
				prepareOptions({ potSources: [] })
			);
		}).toThrow(re);
		expect(() => {
			resolvePOTFilepaths(
				prepareOptions({ potSources: ['NON_EXISTING.pot'] })
			);
		}).toThrow(re);
	});
});
