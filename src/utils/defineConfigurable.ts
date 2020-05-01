/**
 * Defines non-writable/enumerable properties of the provided target object.
 *
 * @param target Object for which to define properties.
 * @param props Properties to be defined.
 * @returns Target object.
 */
export default (target: object, props: Record<string, unknown>) => {
  for (const key of Object.keys(props)) {
    Object.defineProperty(target, key, {
      value: props[key],
      enumerable: false,
      writable: false,
      configurable: true
    });
  }

  return target;
};
