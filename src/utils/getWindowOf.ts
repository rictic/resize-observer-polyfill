import global from '../shims/global.js';

/**
 * Returns the global object associated with provided element.
 *
 * @param {EventT} target
 * @returns {Object}
 */
export default (target: Partial<Node>): typeof window => {
  // Assume that the element is an instance of Node, which means that it
  // has the "ownerDocument" property from which we can retrieve a
  // corresponding global object.
  // Return the local global object if it's not possible extract one from
  // provided element.
  return target?.ownerDocument?.defaultView || global;
};
