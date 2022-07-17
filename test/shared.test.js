'use strict';

const { resolvePOTFilepaths } = require('../src/shared');
const prepareOptions = require('../src/options');

const Vinyl = require('vinyl');

const potSource = ['./test/examples/text-domain.pot'];
const vinyl_file = new Vinyl({
  contents: Buffer.from('some contents'),
  path: 'filename.pot',
});

describe('shared.js - resolvePOTFilepaths()', () => {
  test('leave poSources empty if multiple potSources', () => {
    const re = new RegExp('leave option poSources empty');
    expect(() => {
      resolvePOTFilepaths(prepareOptions({ poSources: '' }));
    }).not.toThrow(re);
    expect(() => {
      resolvePOTFilepaths(prepareOptions({ poSources: '*.po' }));
    }).toThrow(re);
    expect(() => {
      resolvePOTFilepaths(prepareOptions({ poSources: ['*.po'] }));
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
      resolvePOTFilepaths(prepareOptions({ potSources: [] }));
    }).toThrow(re);
    expect(() => {
      resolvePOTFilepaths(prepareOptions({ potSources: ['NON_EXISTING.pot'] }));
    }).toThrow(re);
  });

  test('store POT filenames', () => {
    let options = null;
    expect(() => {
      options = resolvePOTFilepaths({ potSources: [vinyl_file] });
    }).not.toThrow();
    expect(options).not.toBeNull();
    expect(options).toHaveProperty('_potFilenames', [vinyl_file.path]);

    options = null;
    expect(() => {
      options = resolvePOTFilepaths({
        potSources: ['test/examples/text-domain.pot'],
      });
    }).not.toThrow();
    expect(options).not.toBeNull();
    expect(options).toHaveProperty('_potFilenames', [
      'test/examples/text-domain.pot',
    ]);
  });

  /**
   * logResults() is tested in sync.test.js, inside tests:
   * 	- 'manual empty PO array'
   * 	- 'extras - auto domain PO - write - content optionals'
   */
});
