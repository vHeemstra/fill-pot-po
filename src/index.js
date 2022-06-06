'use strict';

const fillPotPo = require('./async');
const fillPotPoSync = require('./sync');

const the_module = module.exports = fillPotPo;

the_module.sync = fillPotPoSync;

// Default options for generating PO files
// used in tests as the correct ones.
the_module.testOptions = {
	wrapLength: 77,
	defaultContextAsFallback: true,
	appendNonIncludedFromPO: true,
	includePORevisionDate: false,
	includeGenerator: false,
};
