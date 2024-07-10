import PluginError from '../src/plugin-error.js';
import * as util from 'node:util';

describe('plugin-error.js', () => {
  const error = new PluginError('SOMEERROR', 'AaAaA');

  test('includes message', () => {
    expect(error.toString()).toMatch(/AaaaaError/);
  });

  test('includes category', () => {
    expect(error.toString()).toMatch(/SOMEERROR/);
  });

  test('method used when console.log() calls .toString()', () => {
    expect(error.toString()).toEqual(error[util.inspect.custom]());
  });
});
