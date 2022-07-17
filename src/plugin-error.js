'use strict';

const util = require('util');
const c = require('ansi-colors');
c.enabled = require('color-support').hasBasic;

const pluginname = require('../package.json').name;

// class PluginError extends Error {
class PluginError {
  constructor(message, category = '') {
    // super( message );
    // this.name = 'PluginError';
    this.message = message;
    this.category =
      category.slice(0, 1).toUpperCase() + category.slice(1).toLowerCase();
  }

  toString() {
    return `${c.cyan(pluginname)}  ${c.bold.red(`${this.category}Error`)}  ${
      this.message
    }`;
  }

  // See: https://nodejs.org/api/util.html#custom-inspection-functions-on-objects
  [util.inspect.custom]() {
    // (depth, options, inspect) {
    return this.toString();
  }
}

module.exports = PluginError;

/*
 * TODO? ideas for new way of error writing + compile/display
 */
// PluginError('mergePotPo() requires a callback function as first argument.').during('processing').ofType('PO').of('file.po')
// PluginError('Missing file.').during('processing', 'PO', 'file.po')
// PluginError('should be integer').during('processing').ofType('option').of('lineWrap')

// ${item_type}${item_name}${belonging_to}${error}

// // (Option )(lineWrap)      ()                ( should be an integer).
// // ()       (First argument)( of mergePotPO())( should be a callback function).
