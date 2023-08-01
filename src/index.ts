import fillPotPo from './async';
import fillPotPoSync from './sync';
export type { AsyncCallback } from './async';
import prepareOptions from './options';

/*
 * Default content-related options for generating PO files.
 * Use these when generating and testing PO files to ensure a proper comparison.
 */
const testOptions = {
  wrapLength: 77,
  defaultContextAsFallback: true,
  appendNonIncludedFromPO: true,
  includePORevisionDate: false,
  includeGenerator: false,
};

export default fillPotPo;
export { fillPotPoSync as sync, testOptions, prepareOptions };
// export { fillPotPo as default, fillPotPoSync as sync, testOptions, prepareOptions };

/**
 * Unfortunately needed shim for fixing the problem with ugly import syntax.
 * Before:
 *   `const fillPotPo = require('fill-pot-po').default`
 * After:
 *   `const fillPotPo = require('fill-pot-po')`
 * See: https://github.com/egoist/tsup/issues/255#issuecomment-784856826
 */
/* eslint-disable */
if (typeof module !== 'undefined') {
  // @ts-ignore
  fillPotPo.sync = fillPotPoSync;
  // @ts-ignore
  fillPotPo.testOptions = testOptions;
  // @ts-ignore
  fillPotPo.prepareOptions = prepareOptions;
  // @ts-ignore
  module.exports = fillPotPo;
  // @ts-ignore
  module.exports.default = fillPotPo;
}
/* eslint-enable */
