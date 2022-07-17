'use strict';

const fillPotPo = require('../src/async');
const { testOptions } = require('../src/index');

const { sync: matchedSync } = require('matched');
const fs = require('fs');
const { relative } = require('path');
const Vinyl = require('vinyl');

const potSource = './test/examples/text-domain.pot';
// const potSources = './test/examples/*.pot';
const poSources = './test/examples/input/*.po';
// const poSource = './test/examples/input/nl_NL.po';
const input_dir = 'test/examples/input/';
const expected_dir = 'test/examples/output_correct/';
const test_dir = 'test/examples/output/fa';

const pot_source_buffer = fs.readFileSync(potSource);
const expected_po_domain = fs.readFileSync(
  `${expected_dir}text-domain-nl_NL.po`
);
const expected_po_no_domain = fs.readFileSync(`${expected_dir}nl_NL.po`);

/**
 * Delete all temporary testing folders and files.
 *
 * @return {void}
 */
function clearOutputFolder() {
  let files = matchedSync([`${test_dir}*`]);
  files.sort((a, b) => {
    const a_len = a.split(/\//);
    const b_len = b.split(/\//);
    return b_len - a_len;
  });
  for (const file of files) {
    fs.rmSync(file, { recursive: true });
  }
}

beforeAll(() => {
  clearOutputFolder();
});

afterAll(() => {
  clearOutputFolder();
});

describe('async.js - single POT', () => {
  let folder_i = 0;

  /* eslint-disable jest/no-done-callback */

  test('auto domain PO - no write', (done) => {
    folder_i++;
    let folder_path = `${test_dir}${folder_i}`;
    if (!fs.existsSync(folder_path)) {
      fs.mkdirSync(folder_path, { recursive: true });
    }

    const options = {
      ...testOptions,
      potSources: [potSource],
      srcDir: input_dir,
      writeFiles: false,
      destDir: folder_path,
    };

    function cb(result_array) {
      try {
        // Errorless execution
        expect(result_array).toHaveLength(2);
        const [was_success, result] = result_array;
        expect(was_success).toBe(true);

        // Check returned array
        expect(result).toHaveLength(1);
        expect(result[0]).toBeInstanceOf(Vinyl);
        expect(result[0].isBuffer()).toBe(true);
        expect(result[0].path).toEqual('text-domain-nl_NL.po');

        // Check that no files were created
        const files = matchedSync([`${folder_path}/*`]);
        expect(files).toHaveLength(0);

        // Check contents
        expect(result[0].contents.equals(expected_po_domain)).toBe(true);

        done();
      } catch (error) {
        done(error);
      }
    }

    fillPotPo(cb, options);
  });

  test('auto no-domain PO - no write', (done) => {
    folder_i++;
    let folder_path = `${test_dir}${folder_i}`;
    if (!fs.existsSync(folder_path)) {
      fs.mkdirSync(folder_path, { recursive: true });
    }

    const options = {
      ...testOptions,
      potSources: [potSource],
      srcDir: input_dir,
      domainInPOPath: false,
      writeFiles: false,
      destDir: folder_path,
    };

    function cb(result_array) {
      try {
        // Errorless execution
        expect(result_array).toHaveLength(2);
        const [was_success, result] = result_array;
        expect(was_success).toBe(true);

        // Check returned array
        expect(result).toHaveLength(1);
        expect(result[0]).toBeInstanceOf(Vinyl);
        expect(result[0].isBuffer()).toBe(true);
        expect(result[0].path).toEqual('nl_NL.po');

        // Check that no files were created
        const files = matchedSync([`${folder_path}/*`]);
        expect(files).toHaveLength(0);

        // Check contents
        expect(result[0].contents.equals(expected_po_no_domain)).toBe(true);

        done();
      } catch (error) {
        done(error);
      }
    }

    fillPotPo(cb, options);
  });

  test('manual multiple PO - no write', (done) => {
    folder_i++;
    let folder_path = `${test_dir}${folder_i}`;
    if (!fs.existsSync(folder_path)) {
      fs.mkdirSync(folder_path, { recursive: true });
    }

    const options = {
      ...testOptions,
      potSources: [potSource],
      poSources: [poSources],
      srcDir: input_dir,
      writeFiles: false,
      destDir: folder_path,
    };

    function cb(result_array) {
      try {
        // Errorless execution
        expect(result_array).toHaveLength(2);
        const [was_success, result] = result_array;
        expect(was_success).toBe(true);

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
        expect(result[0].contents.equals(expected_po_no_domain)).toBe(true);
        expect(result[1].contents.equals(expected_po_domain)).toBe(true);

        done();
      } catch (error) {
        done(error);
      }
    }

    fillPotPo(cb, options);
  });

  test('auto domain PO - write', (done) => {
    folder_i++;
    let folder_path = `${test_dir}${folder_i}`;
    if (!fs.existsSync(folder_path)) {
      fs.mkdirSync(folder_path, { recursive: true });
    }

    const options = {
      ...testOptions,
      potSources: [potSource],
      srcDir: input_dir,
      writeFiles: true,
      destDir: folder_path,
    };

    function cb(result_array) {
      try {
        // Errorless execution
        expect(result_array).toHaveLength(2);
        const [was_success, result] = result_array;
        expect(was_success).toBe(true);

        // Check returned array
        expect(result).toHaveLength(1);
        expect(result[0]).toBeInstanceOf(Vinyl);
        expect(result[0].isBuffer()).toBe(true);
        expect(result[0].path).toEqual('text-domain-nl_NL.po');

        // Check if file exist
        const files = matchedSync([`${folder_path}/*`]);
        expect(files).toHaveLength(1);
        expect(files).toEqual([`${folder_path}/text-domain-nl_NL.po`]);

        // Check contents of file
        expect(
          fs
            .readFileSync(`${folder_path}/text-domain-nl_NL.po`)
            .equals(expected_po_domain)
        ).toBe(true);

        done();
      } catch (error) {
        done(error);
      }
    }

    fillPotPo(cb, options);
  });

  test('auto no-domain PO - write', (done) => {
    folder_i++;
    let folder_path = `${test_dir}${folder_i}`;
    if (!fs.existsSync(folder_path)) {
      fs.mkdirSync(folder_path, { recursive: true });
    }

    const options = {
      ...testOptions,
      potSources: [potSource],
      srcDir: input_dir,
      domainInPOPath: false,
      writeFiles: true,
      destDir: folder_path,
    };

    function cb(result_array) {
      try {
        // Errorless execution
        expect(result_array).toHaveLength(2);
        const [was_success, result] = result_array;
        expect(was_success).toBe(true);

        // Check returned array
        expect(result).toHaveLength(1);
        expect(result[0]).toBeInstanceOf(Vinyl);
        expect(result[0].isBuffer()).toBe(true);
        expect(result[0].path).toEqual('nl_NL.po');

        // Check if file exist
        const files = matchedSync([`${folder_path}/*`]);
        expect(files).toHaveLength(1);
        expect(files).toEqual([`${folder_path}/nl_NL.po`]);

        // Check contents of file
        expect(
          fs
            .readFileSync(`${folder_path}/nl_NL.po`)
            .equals(expected_po_no_domain)
        ).toBe(true);

        done();
      } catch (error) {
        done(error);
      }
    }

    fillPotPo(cb, options);
  });

  test('manual multiple PO - write', (done) => {
    folder_i++;
    let folder_path = `${test_dir}${folder_i}`;
    if (!fs.existsSync(folder_path)) {
      fs.mkdirSync(folder_path, { recursive: true });
    }

    const options = {
      ...testOptions,
      potSources: [potSource],
      poSources: [poSources],
      srcDir: input_dir,
      writeFiles: true,
      destDir: folder_path,
    };

    function cb(result_array) {
      try {
        // Errorless execution
        expect(result_array).toHaveLength(2);
        const [was_success, result] = result_array;
        expect(was_success).toBe(true);

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
          fs
            .readFileSync(`${folder_path}/nl_NL.po`)
            .equals(expected_po_no_domain)
        ).toBe(true);
        expect(
          fs
            .readFileSync(`${folder_path}/text-domain-nl_NL.po`)
            .equals(expected_po_domain)
        ).toBe(true);

        done();
      } catch (error) {
        done(error);
      }
    }

    fillPotPo(cb, options);
  });

  test('manual empty PO array', (done) => {
    folder_i++;
    let folder_path = `${test_dir}${folder_i}`;
    if (!fs.existsSync(folder_path)) {
      fs.mkdirSync(folder_path, { recursive: true });
    }

    // Mock the console.log function
    const consoleSpy = jest
      .spyOn(console, 'log')
      .mockName('console.log')
      .mockImplementation((...args) => {
        return args
          .map((v) => String(v).trim().replaceAll(/\s+/g, ' '))
          .join(' ');
      });

    const options = {
      ...testOptions,
      potSources: [potSource],
      poSources: [],
      srcDir: input_dir,
      writeFiles: false,
      logResults: true,
    };

    function cb(result_array) {
      try {
        // Errorless execution
        expect(result_array).toHaveLength(2);
        const [was_success, result] = result_array;
        expect(was_success).toBe(true);

        // Check returned array
        expect(result).toHaveLength(0);

        // Check that no files were created
        const files = matchedSync([`${folder_path}/*`]);
        expect(files).toHaveLength(0);

        // Check if results were logged
        expect(consoleSpy).toHaveBeenCalledTimes(4);
        const logs = consoleSpy.mock.results.slice();
        expect(logs[0].value + logs[3].value).toEqual('');
        expect(logs[1].value).toMatch(
          new RegExp('■ ' + potSource.split('/').slice(-1)[0])
        );
        expect(logs[2].value).toMatch(new RegExp('No PO files found.'));

        // Restore the console.log function
        consoleSpy.mockRestore();

        done();
      } catch (error) {
        done(error);
      }
    }

    fillPotPo(cb, options);
  });

  test('auto domain PO - write - return POT', (done) => {
    folder_i++;
    let folder_path = `${test_dir}${folder_i}`;
    if (!fs.existsSync(folder_path)) {
      fs.mkdirSync(folder_path, { recursive: true });
    }

    const options = {
      ...testOptions,
      potSources: [potSource],
      srcDir: input_dir,
      returnPOT: true,
      writeFiles: true,
      destDir: folder_path,
    };

    function cb(result_array) {
      try {
        // Errorless execution
        expect(result_array).toHaveLength(2);
        const [was_success, result] = result_array;
        expect(was_success).toBe(true);

        // Check returned array
        expect(result).toHaveLength(1);
        expect(result[0]).toBeInstanceOf(Vinyl);
        expect(result[0].isBuffer()).toBe(true);
        expect(relative(result[0].path, potSource)).toEqual('');

        // Check contents
        expect(result[0].contents.equals(pot_source_buffer)).toBe(true);

        // Check if file exist
        const files = matchedSync([`${folder_path}/*`]);
        expect(files).toHaveLength(1);
        expect(files).toEqual([`${folder_path}/text-domain-nl_NL.po`]);

        // Check contents of file
        expect(
          fs
            .readFileSync(`${folder_path}/text-domain-nl_NL.po`)
            .equals(expected_po_domain)
        ).toBe(true);

        done();
      } catch (error) {
        done(error);
      }
    }

    fillPotPo(cb, options);
  });

  test('auto domain PO - no write - input POT Vinyl', (done) => {
    const options = {
      ...testOptions,
      potSources: new Vinyl({
        contents: pot_source_buffer,
        path: potSource,
      }),
      srcDir: input_dir,
      writeFiles: false,
    };

    function cb(result_array) {
      try {
        // Errorless execution
        expect(result_array).toHaveLength(2);
        const [was_success, result] = result_array;
        expect(was_success).toBe(true);

        // Check returned array
        expect(result).toHaveLength(1);
        expect(result[0]).toBeInstanceOf(Vinyl);
        expect(result[0].isBuffer()).toBe(true);
        expect(result[0].path).toEqual('text-domain-nl_NL.po');

        // Check contents
        expect(result[0].contents.equals(expected_po_domain)).toBe(true);

        done();
      } catch (error) {
        done(error);
      }
    }

    fillPotPo(cb, options);
  });

  test('auto domain PO - write - return POT - input POT Vinyl', (done) => {
    folder_i++;
    let folder_path = `${test_dir}${folder_i}`;
    if (!fs.existsSync(folder_path)) {
      fs.mkdirSync(folder_path, { recursive: true });
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

    function cb(result_array) {
      try {
        // Errorless execution
        expect(result_array).toHaveLength(2);
        const [was_success, result] = result_array;
        expect(was_success).toBe(true);

        // Check returned array
        expect(result).toHaveLength(1);
        expect(result[0]).toBeInstanceOf(Vinyl);
        expect(result[0].isBuffer()).toBe(true);
        expect(relative(result[0].path, potSource)).toEqual('');

        // Check contents
        expect(result[0].contents.equals(pot_source_buffer)).toBe(true);

        // Check if file exist
        const files = matchedSync([`${folder_path}/*`]);
        expect(files).toHaveLength(1);
        expect(files).toEqual([`${folder_path}/text-domain-nl_NL.po`]);

        // Check contents of file
        expect(
          fs
            .readFileSync(`${folder_path}/text-domain-nl_NL.po`)
            .equals(expected_po_domain)
        ).toBe(true);

        done();
      } catch (error) {
        done(error);
      }
    }

    fillPotPo(cb, options);
  });

  test('extras - auto domain PO - write - content optionals', (done) => {
    folder_i++;
    let folder_path = `${test_dir}${folder_i}`;

    // Mock the console.log function
    const consoleSpy = jest
      .spyOn(console, 'log')
      .mockName('console.log')
      .mockImplementation((...args) => {
        return args
          .map((v) => String(v).trim().replaceAll(/\s+/g, ' '))
          .join(' ');
      });

    const options = {
      ...testOptions,
      potSources: [potSource],
      srcDir: input_dir,
      writeFiles: true,
      destDir: folder_path,
      logResults: true,
      appendNonIncludedFromPO: false,
      includePORevisionDate: true,
      includeGenerator: true,
    };

    function cb(result_array) {
      try {
        // Errorless execution
        expect(result_array).toHaveLength(2);
        const [was_success, result] = result_array;
        expect(was_success).toBe(true);

        // Check returned array
        expect(result).toHaveLength(1);
        expect(result[0]).toBeInstanceOf(Vinyl);
        expect(result[0].isBuffer()).toBe(true);
        expect(result[0].path).toEqual('text-domain-nl_NL.po');

        // Check if folder and file exist
        expect(fs.existsSync(folder_path)).toBe(true);
        const files = matchedSync([`${folder_path}/*`]);
        expect(files).toHaveLength(1);
        expect(files).toEqual([`${folder_path}/text-domain-nl_NL.po`]);

        // Check contents
        const result_string_content = result[0].contents.toString();
        expect(result_string_content).not.toMatch(/^# DEPRECATED$/m);
        expect(result_string_content).toMatch(
          /^"PO-Revision-Date: \d{4}-\d{2}-\d{2} \d{2}:\d{2}\+0000\\n"$/m
        );
        expect(result_string_content).toMatch(
          /^"X-Generator: fill-pot-po\/\d+\.\d+\.\d+\\n"$/m
        );

        // Check if results were logged
        expect(consoleSpy).toHaveBeenCalledTimes(4);
        const logs = consoleSpy.mock.results.slice();
        expect(logs[0].value + logs[3].value).toEqual('');
        expect(logs[1].value).toMatch(
          new RegExp('■ ' + potSource.split('/').slice(-1)[0])
        );
        expect(logs[2].value).toMatch(
          new RegExp(
            `${input_dir}text-domain-nl_NL.po —► ${folder_path}/text-domain-nl_NL.po`
          )
        );

        // Restore the console.log function
        consoleSpy.mockRestore();

        done();
      } catch (error) {
        done(error);
      }
    }

    fillPotPo(cb, options);
  });

  test('return options error', (done) => {
    const options = {
      ...testOptions,
      potSources: true,
      writeFiles: false,
    };

    function cb(result_array) {
      try {
        // Errorless execution
        expect(result_array).toHaveLength(2);
        const [was_success, result] = result_array;
        expect(was_success).toBe(false);

        // Check returned array
        expect(result).toMatch(
          new RegExp('Option potSources should be a string')
        );

        done();
      } catch (error) {
        done(error);
      }
    }

    fillPotPo(cb, options);
  });

  test('return POT fs.readFile error', (done) => {
    // Mock the fs.readFile function
    const readFileSpy = jest
      .spyOn(fs, 'readFile')
      .mockName('fs.readFile')
      .mockImplementation((path, cb) => {
        // first: *.pot
        // then: *.po
        cb({ message: 'POT_MOCK_FS_READFILE_ERROR' }, '');
      });

    const options = {
      ...testOptions,
      potSources: [potSource],
      srcDir: input_dir,
      writeFiles: false,
    };

    function cb(result_array) {
      try {
        // Errorless execution
        expect(result_array).toHaveLength(2);
        const [was_success, result] = result_array;
        expect(was_success).toBe(false);

        // Check returned array
        expect(result).toMatch(new RegExp('POT_MOCK_FS_READFILE_ERROR'));

        // Restore the fs.readFile function
        readFileSpy.mockRestore();

        done();
      } catch (error) {
        done(error);
      }
    }

    fillPotPo(cb, options);
  });

  test('return PO fs.readFile error', (done) => {
    // Mock the fs.readFile function
    const origReadFile = fs.readFile;
    const readFileSpy = jest
      .spyOn(fs, 'readFile')
      .mockName('fs.readFile')
      .mockImplementation((path, cb) => {
        // first *.pot
        if (path.match(/\.pot$/i)) {
          origReadFile(path, cb);
          return;
        }
        // then *.po
        cb({ message: 'PO_MOCK_FS_READFILE_ERROR' }, '');
      });

    const options = {
      ...testOptions,
      potSources: [potSource],
      srcDir: input_dir,
      writeFiles: false,
    };

    function cb(result_array) {
      try {
        // Errorless execution
        expect(result_array).toHaveLength(2);
        const [was_success, result] = result_array;
        expect(was_success).toBe(false);

        // Check returned array
        expect(result).toMatch(new RegExp('PO_MOCK_FS_READFILE_ERROR'));

        // Restore the fs.readFile function
        readFileSpy.mockRestore();

        done();
      } catch (error) {
        done(error);
      }
    }

    fillPotPo(cb, options);
  });

  /* eslint-enable jest/no-done-callback */

  test('fillPotPo requires a callback', () => {
    expect(() => {
      fillPotPo();
    }).toThrow(/fillPotPo\(\) requires a callback function as first parameter/);
  });
});

// TODO? potSources: Vinyl or Array-of
// TODO? multiple POT files?
