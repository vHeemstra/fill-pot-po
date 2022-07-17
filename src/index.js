'use strict';

const fillPotPo = require('./async');
const fillPotPoSync = require('./sync');

const the_module = (module.exports = fillPotPo);

the_module.sync = fillPotPoSync;

/*
 * Default content-related options for generating PO files.
 * Use these when generating and testing PO files to ensure a proper comparison.
 */
the_module.testOptions = {
  wrapLength: 77,
  defaultContextAsFallback: true,
  appendNonIncludedFromPO: true,
  includePORevisionDate: false,
  includeGenerator: false,
};
