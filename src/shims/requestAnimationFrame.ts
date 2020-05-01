import global from './global.js';

/**
 * A shim for the requestAnimationFrame which falls back to the setTimeout if
 * first one is not supported.
 *
 * @returns {number} Requests' identifier.
 */
export default (() => {
  if (typeof requestAnimationFrame === 'function') {
    // It's required to use a bounded function because IE sometimes throws
    // an "Invalid calling object" error if rAF is invoked without the global
    // object on the left hand side.
    return requestAnimationFrame.bind(global);
  }

  const result: typeof requestAnimationFrame =
      (callback: (time: number) => void) => {
        return setTimeout(() => {callback(+Date.now())}, 1000 / 60) as
            unknown as number;
      };

  return result;
})();
