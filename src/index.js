'use strict';

const fillPotPo = require('./async');
const fillPotPoSync = require('./sync');

// See: https://stackoverflow.com/a/54047219/2142071
const the_module = module.exports = fillPotPo;
the_module.sync = fillPotPoSync;
