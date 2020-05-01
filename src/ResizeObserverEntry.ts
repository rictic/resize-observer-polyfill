import defineConfigurable from './utils/defineConfigurable.js';
import {createReadOnlyRect} from './utils/geometry.js';

export default class ResizeObserverEntry {
  /**
   * Element size of which has changed.
   * Spec: https://wicg.github.io/ResizeObserver/#dom-resizeobserverentry-target
   */
  readonly target!: Element;

  /**
   * Element's content rectangle.
   * Spec:
   * https://wicg.github.io/ResizeObserver/#dom-resizeobserverentry-contentrect
   */
  readonly contentRect!: DOMRectReadOnly;

  /**
   * Creates an instance of ResizeObserverEntry.
   *
   * @param target Element that is being observed.
   * @param rectInit Data of the element's content rectangle.
   */
  constructor(target: Element, rectInit: DOMRectInit) {
    const contentRect = createReadOnlyRect(rectInit);

    // According to the specification following properties are not writable
    // and are also not enumerable in the native implementation.
    //
    // Property accessors are not being used as they'd require to define a
    // private WeakMap storage which may cause memory leaks in browsers that
    // don't support this type of collections.
    defineConfigurable(this, {target, contentRect});
  }
}
