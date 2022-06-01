'use strict';

const prepareOptions = require('../src/options');

const { escapeRegExp } = require('../src/utils');

function reOptionError(k) {
	return new RegExp(`option ${escapeRegExp(k)}`, 'i');
}

const potSource = ['./test/examples/text-domain.pot'];

describe('options.js - validate', () => {
	// String only
	const string_only = [ 'srcDir', 'destDir', 'domain' ];
	string_only.forEach(k => {
		test(`${k} - only string`, () => {
			expect(() => {
				prepareOptions({ [k]: null });
			}).toThrow(reOptionError(k));
			expect(() => {
				prepareOptions({ [k]: false });
			}).toThrow(reOptionError(k));
			expect(() => {
				prepareOptions({ [k]: true });
			}).toThrow(reOptionError(k));
			expect(() => {
				prepareOptions({ [k]: 1 });
			}).toThrow(reOptionError(k));
			expect(() => {
				prepareOptions({ [k]: '' });
			}).not.toThrow(reOptionError(k));
			expect(() => {
				prepareOptions({ [k]: [] });
			}).toThrow(reOptionError(k));
			expect(() => {
				prepareOptions({ [k]: {} });
			}).toThrow(reOptionError(k));
		});
	});

	// Boolean only
	const bool_only = [
		'writeFiles',
		'domainFromPOTPath',
		'domainInPOPath',
		'defaultContextAsFallback',
		'appendNonIncludedFromPO',
		'includePORevisionDate',
		'logResults',
	];
	bool_only.forEach(k => {
		test(`${k} - only boolean`, () => {
			expect(() => {
				prepareOptions({ [k]: null });
			}).toThrow(reOptionError(k));
			expect(() => {
				prepareOptions({ [k]: false });
			}).not.toThrow(reOptionError(k));
			expect(() => {
				prepareOptions({ [k]: true });
			}).not.toThrow(reOptionError(k));
			expect(() => {
				prepareOptions({ [k]: 1 });
			}).toThrow(reOptionError(k));
			expect(() => {
				prepareOptions({ [k]: '' });
			}).toThrow(reOptionError(k));
			expect(() => {
				prepareOptions({ [k]: [] });
			}).toThrow(reOptionError(k));
			expect(() => {
				prepareOptions({ [k]: {} });
			}).toThrow(reOptionError(k));
		});
	});

	// Number only
	const number_only = [ 'wrapLength' ];
	number_only.forEach(k => {
		test(`${k} - only number`, () => {
			expect(() => {
				prepareOptions({ [k]: null });
			}).toThrow(reOptionError(k));
			expect(() => {
				prepareOptions({ [k]: false });
			}).toThrow(reOptionError(k));
			expect(() => {
				prepareOptions({ [k]: true });
			}).toThrow(reOptionError(k));
			expect(() => {
				prepareOptions({ [k]: 1 });
			}).not.toThrow(reOptionError(k));
			expect(() => {
				prepareOptions({ [k]: '' });
			}).toThrow(reOptionError(k));
			expect(() => {
				prepareOptions({ [k]: [] });
			}).toThrow(reOptionError(k));
			expect(() => {
				prepareOptions({ [k]: {} });
			}).toThrow(reOptionError(k));
		});
	});

	// Array only
	const array_only = [ 'potSources' ];
	array_only.forEach(k => {
		test(`${k} - only array`, () => {
			expect(() => {
				prepareOptions({ [k]: null });
			}).toThrow(reOptionError(k));
			expect(() => {
				prepareOptions({ [k]: false });
			}).toThrow(reOptionError(k));
			expect(() => {
				prepareOptions({ [k]: true });
			}).toThrow(reOptionError(k));
			expect(() => {
				prepareOptions({ [k]: 1 });
			}).toThrow(reOptionError(k));
			expect(() => {
				prepareOptions({ [k]: '' });
			}).toThrow(reOptionError(k));
			expect(() => {
				prepareOptions({ [k]: potSource });
			}).not.toThrow(reOptionError(k));
			expect(() => {
				prepareOptions({ [k]: {} });
			}).toThrow(reOptionError(k));
		});
	});

	test('options - only absent, object, glob string or glob array', () => {
		const re = /Options should be an object/;

		expect(() => {
			prepareOptions();
		}).not.toThrow(re);

		expect(() => {
			prepareOptions(undefined);
		}).not.toThrow(re);

		expect(() => {
			prepareOptions(null);
		}).toThrow(re);

		expect(() => {
			prepareOptions(false);
		}).toThrow(re);

		expect(() => {
			prepareOptions(true);
		}).toThrow(re);

		expect(() => {
			prepareOptions(1);
		}).toThrow(re);

		expect(() => {
			prepareOptions('**/*.po');
		}).not.toThrow(re);

		expect(() => {
			prepareOptions([]);
		}).not.toThrow(re);

		expect(() => {
			prepareOptions({});
		}).not.toThrow(re);

		expect(() => {
			prepareOptions([1]);
		}).toThrow(re);

		expect(() => {
			prepareOptions([true]);
		}).toThrow(re);

		expect(() => {
			prepareOptions(['**/*.po']);
		}).not.toThrow(re);

		expect(() => {
			prepareOptions([[]]);
		}).toThrow(re);

		expect(() => {
			prepareOptions([{}]);
		}).toThrow(re);
	});

	test('poSources - if truthy, only string or array of strings', () => {
		const re = reOptionError('poSources');

		expect(() => {
			prepareOptions({ potSources: potSource, poSources: null });
		}).not.toThrow(re);

		expect(() => {
			prepareOptions({ potSources: potSource, poSources: false });
		}).not.toThrow(re);

		expect(() => {
			prepareOptions({ potSources: potSource, poSources: true });
		}).toThrow(re);

		expect(() => {
			prepareOptions({ potSources: potSource, poSources: 1 });
		}).toThrow(re);

		expect(() => {
			prepareOptions({ potSources: potSource, poSources: '**/*.po' });
		}).not.toThrow(re);

		expect(() => {
			prepareOptions({ potSources: potSource, poSources: ['**/*.po'] });
		}).not.toThrow(re);

		expect(() => {
			prepareOptions({ potSources: potSource, poSources: {} });
		}).toThrow(re);

		expect(() => {
			prepareOptions({ potSources: potSource, poSources: [1] });
		}).toThrow(re);

		expect(() => {
			prepareOptions({ potSources: potSource, poSources: [true] });
		}).toThrow(re);

		expect(() => {
			prepareOptions({ potSources: potSource, poSources: [[]] });
		}).toThrow(re);

		expect(() => {
			prepareOptions({ potSources: potSource, poSources: [{}] });
		}).toThrow(re);
	});

	test('srcDir - no newlines', () => {
		expect(() => {
			prepareOptions({ srcDir: 'some\npath' });
		}).toThrow(reOptionError('srcDir'));
	});

	test('destDir - no newlines', () => {
		expect(() => {
			prepareOptions({ destDir: 'some\npath' });
		}).toThrow(reOptionError('destDir'));
	});

	test('wrapLength - only positive integer', () => {
		const re = reOptionError('wrapLength');

		expect(() => {
			prepareOptions({ wrapLength: -1 });
		}).toThrow(re);

		expect(() => {
			prepareOptions({ wrapLength: 0 });
		}).toThrow(re);
	});
});

describe('options.js - clean & standardize', () => {
	test('poSources - is array of only non-empty strings', () => {
		// wrap string
		expect( prepareOptions({ potSources: potSource, poSources: '**/*.po' }) ).toHaveProperty('poSources', ['**/*.po']);

		// filter non-strings and (trimmed) empty strings
		const all = [
			'first',
			' 	 ',
			'second',
			'',
			' \t third\t  ',
		];
		const expected = [
			'first',
			'second',
			'third',
		];
		expect( prepareOptions({ potSources: potSource, poSources: all }) ).toHaveProperty('poSources', expected);
	});

	const directories = [ 'srcDir', 'destDir' ];
	directories.forEach(k => {
		test(`${k} - trimmed whitespace`, () => {
			expect( prepareOptions({ [k]: ' 	 	 	' }) ).toHaveProperty(k, '');
			expect( prepareOptions({ [k]: ' 	 some	 	' }) ).toHaveProperty(k, 'some/');
		});

		test(`${k} - only forward slashes`, () => {
			expect( prepareOptions({ [k]: 'some\\' }) ).toHaveProperty(k, 'some/');
			expect( prepareOptions({ [k]: 'some\\path\\' }) ).toHaveProperty(k, 'some/path/');
		});

		test(`${k} - only single slashes`, () => {
			expect( prepareOptions({ [k]: 'some\\' }) ).toHaveProperty(k, 'some/');
			expect( prepareOptions({ [k]: 'some\\\\' }) ).toHaveProperty(k, 'some/');
			expect( prepareOptions({ [k]: 'some\\/\\/' }) ).toHaveProperty(k, 'some/');
			expect( prepareOptions({ [k]: 'some\\//\\\\' }) ).toHaveProperty(k, 'some/');
		});

		test(`${k} - without current directory parts`, () => {
			expect( prepareOptions({ [k]: './some/' }) ).toHaveProperty(k, 'some/');
			expect( prepareOptions({ [k]: 'some/././.\\path' }) ).toHaveProperty(k, 'some/path/');
			expect( prepareOptions({ [k]: './../some/.\\path' }) ).toHaveProperty(k, '../some/path/');
		});

		test(`${k} - trailing slash`, () => {
			expect( prepareOptions({ [k]: 'some' }) ).toHaveProperty(k, 'some/');
			expect( prepareOptions({ [k]: 'some/' }) ).toHaveProperty(k, 'some/');
			expect( prepareOptions({ [k]: 'some/path' }) ).toHaveProperty(k, 'some/path/');
		});

		test(`${k} - resolve to minimal path`, () => {
			// basic
			expect( prepareOptions({ [k]: 'some/../path' }) ).toHaveProperty(k, 'path/');
			// nested
			expect( prepareOptions({ [k]: 'some/other/../../path' }) ).toHaveProperty(k, 'path/');
			// concurrent
			expect( prepareOptions({ [k]: 'some/other/../path/../' }) ).toHaveProperty(k, 'some/');
			// nested and concurrent
			expect( prepareOptions({ [k]: 'some/other/../path/../../' }) ).toHaveProperty(k, '');
			// leave non-solvables
			expect( prepareOptions({ [k]: './../some/../path' }) ).toHaveProperty(k, '../path/');
			// empty if result would be '/'
			expect( prepareOptions({ [k]: '  ./\\//.\\/.\\	' }) ).toHaveProperty(k, '');
			// combination
			expect( prepareOptions({ [k]: '  ./some\\other/.\\path	' }) ).toHaveProperty(k, 'some/other/path/');
		});
	});

	test('wrapLength - ceiled integer', () => {
		expect( prepareOptions({ wrapLength: 0.001 }) ).toHaveProperty('wrapLength', 1);
		expect( prepareOptions({ wrapLength: 1.2 }) ).toHaveProperty('wrapLength', 2);
	});
});

describe('options.js - logic', () => {
	test('provide domain if domainInPOPath and not domainFromPOTPath', () => {
		const re = new RegExp('domain should be a non-empty string');
		expect(() => {
			prepareOptions({ domainFromPOTPath: false });
		}).toThrow(re);

		expect(() => {
			prepareOptions({ domainFromPOTPath: false, domain: '' });
		}).toThrow(re);

		expect(() => {
			prepareOptions({ domainFromPOTPath: false, domain: 'some' });
		}).not.toThrow(re);

		expect(() => {
			prepareOptions({ domainFromPOTPath: false, domainInPOPath: true });
		}).toThrow(re);

		expect(() => {
			prepareOptions({ domainFromPOTPath: false, domainInPOPath: false });
		}).not.toThrow(re);
	});
});
