import {
  isArray,
  isObject,
  isString,
  isBool,
  isArrayOfStrings,
  isArrayOfVinyls,
  pathLineSort,
} from '../src/utils';
import Vinyl from 'vinyl';

const vinyl_file = new Vinyl({
  contents: Buffer.from('some contents'),
  path: 'filename.pot',
});

class SomeClass {
  constructor() {}
}

function someFunction() {}

/**
 * Helper function to create extensive test filepaths list.
 *
 * @return {array} Filepaths
 */
/* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
function generatePaths() {
  const dirs = [
    '',
    'some/other/path/',
    'some/other/folder/',
    'some/',
    'some/path/',
    'some/quoted/',
  ];

  const files = ['file', 'file.ext', 'file.oth', 'different_file.ext', '.ext'];

  const lines = ['', ':10', ':20', ':100'];

  const filepaths = [].concat(
    ...dirs.map((d) =>
      [d].concat(...files.map((f) => lines.map((l) => `${d}${f}${l}`)))
    )
  );

  return filepaths;
}

/**
 * Shuffle array in-place.
 *
 * @param  {array} array
 * @return {array}
 */
/* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

describe('utils.js - isArray', () => {
  test('false on null', () => {
    expect(isArray(null)).toEqual(false);
  });

  test('false on undefined', () => {
    expect(isArray(undefined)).toEqual(false);
  });

  test('false on number', () => {
    expect(isArray(1)).toEqual(false);
  });

  test('false on boolean true', () => {
    expect(isArray(true)).toEqual(false);
  });

  test('false on boolean false', () => {
    expect(isArray(false)).toEqual(false);
  });

  test('false on string', () => {
    expect(isArray('string')).toEqual(false);
  });

  test('false on class instance', () => {
    expect(isArray(new SomeClass())).toEqual(false);
  });

  test('false on class', () => {
    expect(isArray(SomeClass)).toEqual(false);
  });

  test('false on arrow function', () => {
    expect(isArray(() => {})).toEqual(false);
  });

  test('false on function', () => {
    expect(isArray(someFunction)).toEqual(false);
  });

  test('false on object', () => {
    expect(isArray({})).toEqual(false);
  });

  test('true on array', () => {
    expect(isArray([])).toEqual(true);
  });
});

describe('utils.js - isObject', () => {
  test('false on null', () => {
    expect(isObject(null)).toEqual(false);
  });

  test('false on undefined', () => {
    expect(isObject(undefined)).toEqual(false);
  });

  test('false on number', () => {
    expect(isObject(1)).toEqual(false);
  });

  test('false on boolean true', () => {
    expect(isObject(true)).toEqual(false);
  });

  test('false on boolean false', () => {
    expect(isObject(false)).toEqual(false);
  });

  test('false on string', () => {
    expect(isObject('string')).toEqual(false);
  });

  test('true on class instance', () => {
    expect(isObject(new SomeClass())).toEqual(true);
  });

  test('false on class', () => {
    expect(isObject(SomeClass)).toEqual(false);
  });

  test('false on arrow function', () => {
    expect(isObject(() => {})).toEqual(false);
  });

  test('false on function', () => {
    expect(isObject(someFunction)).toEqual(false);
  });

  test('true on object', () => {
    expect(isObject({})).toEqual(true);
  });

  test('false on array', () => {
    expect(isObject([])).toEqual(false);
  });
});

describe('utils.js - isString', () => {
  test('false on null', () => {
    expect(isString(null)).toEqual(false);
  });

  test('false on undefined', () => {
    expect(isString(undefined)).toEqual(false);
  });

  test('false on number', () => {
    expect(isString(1)).toEqual(false);
  });

  test('false on boolean true', () => {
    expect(isString(true)).toEqual(false);
  });

  test('false on boolean false', () => {
    expect(isString(false)).toEqual(false);
  });

  test('true on string', () => {
    expect(isString('string')).toEqual(true);
  });

  test('false on class instance', () => {
    expect(isString(new SomeClass())).toEqual(false);
  });

  test('false on class', () => {
    expect(isString(SomeClass)).toEqual(false);
  });

  test('false on arrow function', () => {
    expect(isString(() => {})).toEqual(false);
  });

  test('false on function', () => {
    expect(isString(someFunction)).toEqual(false);
  });

  test('false on object', () => {
    expect(isString({})).toEqual(false);
  });

  test('false on array', () => {
    expect(isString([])).toEqual(false);
  });
});

describe('utils.js - isBool', () => {
  test('false on null', () => {
    expect(isBool(null)).toEqual(false);
  });

  test('false on undefined', () => {
    expect(isBool(undefined)).toEqual(false);
  });

  test('false on number', () => {
    expect(isBool(1)).toEqual(false);
  });

  test('true on boolean true', () => {
    expect(isBool(true)).toEqual(true);
  });

  test('true on boolean false', () => {
    expect(isBool(false)).toEqual(true);
  });

  test('false on string', () => {
    expect(isBool('string')).toEqual(false);
  });

  test('false on class instance', () => {
    expect(isBool(new SomeClass())).toEqual(false);
  });

  test('false on class', () => {
    expect(isBool(SomeClass)).toEqual(false);
  });

  test('false on arrow function', () => {
    expect(isBool(() => {})).toEqual(false);
  });

  test('false on function', () => {
    expect(isBool(someFunction)).toEqual(false);
  });

  test('false on object', () => {
    expect(isBool({})).toEqual(false);
  });

  test('false on array', () => {
    expect(isBool([])).toEqual(false);
  });
});

describe('utils.js - isArrayOfStrings', () => {
  test('false on null', () => {
    expect(isArrayOfStrings(null)).toEqual(false);
  });

  test('false on undefined', () => {
    expect(isArrayOfStrings(undefined)).toEqual(false);
  });

  test('false on number', () => {
    expect(isArrayOfStrings(1)).toEqual(false);
  });

  test('false on boolean true', () => {
    expect(isArrayOfStrings(true)).toEqual(false);
  });

  test('false on boolean false', () => {
    expect(isArrayOfStrings(false)).toEqual(false);
  });

  test('false on string', () => {
    expect(isArrayOfStrings('string')).toEqual(false);
  });

  test('false on class instance', () => {
    expect(isArrayOfStrings(new SomeClass())).toEqual(false);
  });

  test('false on class', () => {
    expect(isArrayOfStrings(SomeClass)).toEqual(false);
  });

  test('false on arrow function', () => {
    expect(isArrayOfStrings(() => {})).toEqual(false);
  });

  test('false on function', () => {
    expect(isArrayOfStrings(someFunction)).toEqual(false);
  });

  test('false on object', () => {
    expect(isArrayOfStrings({})).toEqual(false);
  });

  test('true on array', () => {
    expect(isArrayOfStrings([])).toEqual(true);
  });

  test('false on array w/ null', () => {
    expect(isArrayOfStrings([null])).toEqual(false);
  });

  test('false on array w/ undefined', () => {
    expect(isArrayOfStrings([undefined])).toEqual(false);
  });

  test('false on array w/ boolean true', () => {
    expect(isArrayOfStrings([true])).toEqual(false);
  });

  test('false on array w/ boolean false', () => {
    expect(isArrayOfStrings([false])).toEqual(false);
  });

  test('false on array w/ number', () => {
    expect(isArrayOfStrings([1])).toEqual(false);
  });

  test('true on array w/ string', () => {
    expect(isArrayOfStrings([''])).toEqual(true);
  });

  test('false on array w/ class instance', () => {
    expect(isArrayOfStrings([new SomeClass()])).toEqual(false);
  });

  test('false on array w/ class', () => {
    expect(isArrayOfStrings([SomeClass])).toEqual(false);
  });

  test('false on array w/ arrow function', () => {
    expect(isArrayOfStrings([() => {}])).toEqual(false);
  });

  test('false on array w/ function', () => {
    expect(isArrayOfStrings([someFunction])).toEqual(false);
  });

  test('false on array w/ object', () => {
    expect(isArrayOfStrings([{}])).toEqual(false);
  });

  test('false on array w/ array', () => {
    expect(isArrayOfStrings([[]])).toEqual(false);
  });
});

describe('utils.js - isArrayOfVinyls', () => {
  test('false on null', () => {
    expect(isArrayOfVinyls(null)).toEqual(false);
  });

  test('false on undefined', () => {
    expect(isArrayOfVinyls(undefined)).toEqual(false);
  });

  test('false on number', () => {
    expect(isArrayOfVinyls(1)).toEqual(false);
  });

  test('false on boolean true', () => {
    expect(isArrayOfVinyls(true)).toEqual(false);
  });

  test('false on boolean false', () => {
    expect(isArrayOfVinyls(false)).toEqual(false);
  });

  test('false on string', () => {
    expect(isArrayOfVinyls('string')).toEqual(false);
  });

  test('false on class instance', () => {
    expect(isArrayOfVinyls(new SomeClass())).toEqual(false);
  });

  test('false on class', () => {
    expect(isArrayOfVinyls(SomeClass)).toEqual(false);
  });

  test('false on arrow function', () => {
    expect(isArrayOfVinyls(() => {})).toEqual(false);
  });

  test('false on function', () => {
    expect(isArrayOfVinyls(someFunction)).toEqual(false);
  });

  test('false on object', () => {
    expect(isArrayOfVinyls({})).toEqual(false);
  });

  test('true on array', () => {
    expect(isArrayOfVinyls([])).toEqual(true);
  });

  test('false on array w/ null', () => {
    expect(isArrayOfVinyls([null])).toEqual(false);
  });

  test('false on array w/ undefined', () => {
    expect(isArrayOfVinyls([undefined])).toEqual(false);
  });

  test('false on array w/ boolean true', () => {
    expect(isArrayOfVinyls([true])).toEqual(false);
  });

  test('false on array w/ boolean false', () => {
    expect(isArrayOfVinyls([false])).toEqual(false);
  });

  test('false on array w/ number', () => {
    expect(isArrayOfVinyls([1])).toEqual(false);
  });

  test('false on array w/ string', () => {
    expect(isArrayOfVinyls([''])).toEqual(false);
  });

  test('true on array w/ Vinyls', () => {
    expect(isArrayOfVinyls([vinyl_file])).toEqual(true);
  });

  test('false on array w/ class instance', () => {
    expect(isArrayOfVinyls([new SomeClass()])).toEqual(false);
  });

  test('false on array w/ class', () => {
    expect(isArrayOfVinyls([SomeClass])).toEqual(false);
  });

  test('false on array w/ arrow function', () => {
    expect(isArrayOfVinyls([() => {}])).toEqual(false);
  });

  test('false on array w/ function', () => {
    expect(isArrayOfVinyls([someFunction])).toEqual(false);
  });

  test('false on array w/ object', () => {
    expect(isArrayOfVinyls([{}])).toEqual(false);
  });

  test('false on array w/ array', () => {
    expect(isArrayOfVinyls([[]])).toEqual(false);
  });
});

describe('utils.js - pathLineSort', () => {
  // NOTE: no-extension files are treated as folder
  // 1) folders first, files and empty last
  // 2) folder/file names sort alphabetically
  //    (per depth; first by name, then by extension)
  // 3) no line number first
  // 4) line numbers ascending numerically
  const sorted = [
    'file',
    'file:10',
    'file:20',
    'file:100',
    'some/file',
    'some/file:10',
    'some/file:20',
    'some/file:100',
    'some/other/folder/file',
    'some/other/folder/file:10',
    'some/other/folder/file:20',
    'some/other/folder/file:100',
    'some/other/folder/.ext',
    'some/other/folder/.ext:10',
    'some/other/folder/.ext:20',
    'some/other/folder/.ext:100',
    'some/other/folder/different_file.ext',
    'some/other/folder/different_file.ext:10',
    'some/other/folder/different_file.ext:20',
    'some/other/folder/different_file.ext:100',
    'some/other/folder/file.ext',
    'some/other/folder/file.ext:10',
    'some/other/folder/file.ext:20',
    'some/other/folder/file.ext:100',
    'some/other/folder/file.oth',
    'some/other/folder/file.oth:10',
    'some/other/folder/file.oth:20',
    'some/other/folder/file.oth:100',
    'some/other/folder/',
    'some/other/path/file',
    'some/other/path/file:10',
    'some/other/path/file:20',
    'some/other/path/file:100',
    'some/other/path/.ext',
    'some/other/path/.ext:10',
    'some/other/path/.ext:20',
    'some/other/path/.ext:100',
    'some/other/path/different_file.ext',
    'some/other/path/different_file.ext:10',
    'some/other/path/different_file.ext:20',
    'some/other/path/different_file.ext:100',
    'some/other/path/file.ext',
    'some/other/path/file.ext:10',
    'some/other/path/file.ext:20',
    'some/other/path/file.ext:100',
    'some/other/path/file.oth',
    'some/other/path/file.oth:10',
    'some/other/path/file.oth:20',
    'some/other/path/file.oth:100',
    'some/other/path/',
    'some/path/file',
    'some/path/file:10',
    'some/path/file:20',
    'some/path/file:100',
    'some/path/.ext',
    'some/path/.ext:10',
    'some/path/.ext:20',
    'some/path/.ext:100',
    'some/path/different_file.ext',
    'some/path/different_file.ext:10',
    'some/path/different_file.ext:20',
    'some/path/different_file.ext:100',
    'some/path/file.ext',
    'some/path/file.ext:10',
    'some/path/file.ext:20',
    'some/path/file.ext:100',
    'some/path/file.oth',
    'some/path/file.oth:10',
    'some/path/file.oth:20',
    'some/path/file.oth:100',
    'some/path/',
    'some/quoted/file',
    'some/quoted/file:10',
    'some/quoted/file:20',
    'some/quoted/file:100',
    'some/quoted/.ext',
    'some/quoted/.ext:10',
    'some/quoted/.ext:20',
    'some/quoted/.ext:100',
    'some/quoted/different_file.ext',
    'some/quoted/different_file.ext:10',
    'some/quoted/different_file.ext:20',
    'some/quoted/different_file.ext:100',
    'some/quoted/file.ext',
    'some/quoted/file.ext:10',
    'some/quoted/file.ext:20',
    'some/quoted/file.ext:100',
    'some/quoted/file.oth',
    'some/quoted/file.oth:10',
    'some/quoted/file.oth:20',
    'some/quoted/file.oth:100',
    'some/quoted/',
    'some/.ext',
    'some/.ext:10',
    'some/.ext:20',
    'some/.ext:100',
    'some/different_file.ext',
    'some/different_file.ext:10',
    'some/different_file.ext:20',
    'some/different_file.ext:100',
    'some/file.ext',
    'some/file.ext:10',
    'some/file.ext:20',
    'some/file.ext:100',
    'some/file.oth',
    'some/file.oth:10',
    'some/file.oth:20',
    'some/file.oth:100',
    'some/',
    '.ext',
    '.ext:10',
    '.ext:20',
    '.ext:100',
    'different_file.ext',
    'different_file.ext:10',
    'different_file.ext:20',
    'different_file.ext:100',
    'file.a',
    'file.b',
    'file.c',
    'file.d',
    'file.e',
    'file.ext',
    'file.ext:10',
    'file.ext:20',
    'file.ext:100',
    'file.oth',
    'file.oth:10',
    'file.oth:20',
    'file.oth:100',
    '',
  ];

  // let shuffled = shuffle( sorted.slice() );
  const shuffled = [
    'some/quoted/file.ext:100',
    'some/path/file.ext:100',
    'some/path/file.ext:10',
    'some/path/.ext:20',
    'some/other/folder/file.oth:10',
    'some/other/path/file.oth',
    'some/path/file:100',
    'file.ext:10',
    'some/quoted/file:10',
    'some/file:20',
    'some/quoted/.ext',
    'some/other/folder/file.oth:20',
    'some/path/file',
    'some/other/path/file:100',
    'some/file',
    'some/other/path/.ext',
    'file.oth',
    'different_file.ext:10',
    'some/quoted/.ext:10',
    'some/quoted/file.ext',
    'file',
    'some/path/file.ext:20',
    'some/path/file.oth:100',
    'some/other/path/file.ext:100',
    'some/other/folder/file:100',
    'some/quoted/.ext:100',
    'some/other/path/different_file.ext:100',
    'some/quoted/file.oth:100',
    'file.oth:100',
    'some/quoted/file:20',
    'file.oth:20',
    'different_file.ext',
    'some/quoted/file.oth:20',
    'some/other/folder/file:10',
    'file.ext:20',
    'some/.ext:10',
    '',
    'some/other/path/file.ext:10',
    'some/different_file.ext:20',
    '.ext:20',
    'some/quoted/file',
    'some/different_file.ext:10',
    'some/file.oth:100',
    'some/path/file:20',
    'file.e',
    'file.ext',
    'some/',
    'some/path/file.oth:20',
    'some/different_file.ext',
    'some/other/path/file:10',
    'some/quoted/different_file.ext:100',
    'some/other/path/file.oth:10',
    'some/.ext',
    'some/other/folder/different_file.ext',
    'some/file.ext:100',
    'some/quoted/file:100',
    'some/other/path/different_file.ext',
    'file:100',
    'some/.ext:100',
    'some/path/different_file.ext:100',
    'some/path/different_file.ext:10',
    'some/other/path/file.oth:100',
    'some/other/folder/different_file.ext:10',
    'some/quoted/file.ext:20',
    'some/other/path/different_file.ext:20',
    'some/.ext:20',
    'some/quoted/.ext:20',
    'some/other/path/file:20',
    'some/path/file:10',
    'some/file:10',
    'some/path/.ext:10',
    'some/other/path/.ext:100',
    'file.c',
    'file.d',
    'some/path/different_file.ext:20',
    'some/file.ext:20',
    'some/file.oth:10',
    'some/other/path/file.ext:20',
    'some/other/folder/.ext:20',
    'file:20',
    'some/other/folder/file',
    'some/other/folder/file.ext:100',
    'some/other/folder/file.ext:10',
    'some/file.ext',
    'some/quoted/different_file.ext:20',
    'some/other/path/file.oth:20',
    'some/other/path/file',
    'some/other/path/',
    '.ext:10',
    'some/other/path/.ext:10',
    'some/file.oth:20',
    'file.a',
    'some/other/path/file.ext',
    'some/file:100',
    'some/other/folder/file.oth',
    'some/different_file.ext:100',
    'some/other/folder/.ext:10',
    'some/path/different_file.ext',
    'some/quoted/file.oth',
    'some/other/path/different_file.ext:10',
    'some/file.ext:10',
    'some/other/folder/',
    'some/file.oth',
    'some/path/.ext:100',
    'file.oth:10',
    'some/other/folder/.ext',
    'some/quoted/different_file.ext',
    'some/other/folder/file:20',
    'some/quoted/',
    'file.ext:100',
    'some/other/folder/different_file.ext:20',
    'some/other/folder/file.ext:20',
    'some/quoted/different_file.ext:10',
    '.ext',
    'some/quoted/file.ext:10',
    'some/path/',
    'some/path/file.oth',
    'some/other/path/.ext:20',
    'different_file.ext:100',
    'some/path/file.ext',
    'some/quoted/file.oth:10',
    '.ext:100',
    'some/other/folder/different_file.ext:100',
    'some/path/file.oth:10',
    'some/other/folder/file.ext',
    'some/other/folder/.ext:100',
    'some/other/folder/file.oth:100',
    'file:10',
    'file.b',
    'different_file.ext:20',
    'some/path/.ext',
  ];

  test('used as callback for array.sort()', () => {
    expect(shuffled.sort(pathLineSort)).toEqual(sorted);
  });

  test('handles only strings', () => {
    expect(() => {
      // @ts-expect-error - Wrong argument type
      pathLineSort('test.txt', {});
    }).toThrow(new RegExp('pathLineSort: a or b not a string'));
    expect(() => {
      // @ts-expect-error - Wrong argument type
      pathLineSort([], 'test.txt');
    }).toThrow(new RegExp('pathLineSort: a or b not a string'));
  });

  test('return 0 when the same', () => {
    expect(
      pathLineSort('some/path/file.ext:10', 'some/path/file.ext:10')
    ).toEqual(0);
    expect(pathLineSort('some/path/file.ext:', 'some/path/file.ext:')).toEqual(
      0
    );
    expect(pathLineSort('some/path/file.ext', 'some/path/file.ext')).toEqual(0);
    expect(pathLineSort('some/path/file.', 'some/path/file.')).toEqual(0);
    expect(pathLineSort('some/path/file', 'some/path/file')).toEqual(0);
    expect(pathLineSort('some', 'some')).toEqual(0);
  });

  test('return -1', () => {
    expect(pathLineSort('', '')).toEqual(-1);
    expect(
      pathLineSort('some/path/file.ext:1', 'some/path/file.ext:2')
    ).toEqual(-1);
    expect(pathLineSort('some/path/file.ext', 'some/path/file.ext:10')).toEqual(
      -1
    );
    expect(pathLineSort('some/path/file.aaa', 'some/path/file.bbb')).toEqual(
      -1
    );
    expect(pathLineSort('some/path/aaaa.ext', 'some/path/bbbb.ext')).toEqual(
      -1
    );
    expect(pathLineSort('some/path/aaaa', 'some/path/bbbb')).toEqual(-1);
    expect(pathLineSort('some/path/file/', 'some/path/file.ext:10')).toEqual(
      -1
    );
    expect(pathLineSort('some/path/', 'some//')).toEqual(-1);
    expect(pathLineSort('some/path', 'some')).toEqual(-1);
  });

  test('return 1', () => {
    expect(
      pathLineSort('some/path/file.ext:2', 'some/path/file.ext:1')
    ).toEqual(1);
    expect(pathLineSort('some/path/file.ext:10', 'some/path/file.ext')).toEqual(
      1
    );
    expect(pathLineSort('some/path/file.bbb', 'some/path/file.aaa')).toEqual(1);
    expect(pathLineSort('some/path/bbbb.ext', 'some/path/aaaa.ext')).toEqual(1);
    expect(pathLineSort('some/path/bbbb', 'some/path/aaaa')).toEqual(1);
    expect(pathLineSort('some/path/file.ext:10', 'some/path/file/')).toEqual(1);
    expect(pathLineSort('some//', 'some/path/')).toEqual(1);
    expect(pathLineSort('some', 'some/path')).toEqual(1);
  });
});
