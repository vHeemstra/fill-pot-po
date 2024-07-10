import fillPotPo from './async.js';
import fillPotPoSync from './sync.js';
export type { AsyncCallback } from './async.js';
import prepareOptions from './options.js';

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
