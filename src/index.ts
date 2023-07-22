import fillPotPo from './async';
import fillPotPoSync from './sync';

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

export { fillPotPo as default, fillPotPoSync as sync, testOptions };
