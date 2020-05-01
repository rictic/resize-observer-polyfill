import {createRectInit, getContentRect} from './utils/geometry.js';

/**
 * Class that is responsible for computations of the content rectangle of
 * provided DOM element and for keeping track of it's changes.
 */
export default class ResizeObservation {
  /**
   * Reference to the observed element.
   */
  target: Element;

  /**
   * Broadcasted width of content rectangle.
   */
  broadcastWidth: number|undefined = 0;

  /**
   * Broadcasted height of content rectangle.
   */
  broadcastHeight: number|undefined = 0;

  /**
   * Reference to the last observed content rectangle.
   */
  private contentRect_: DOMRectInit = createRectInit(0, 0, 0, 0);

  /**
   * Creates an instance of ResizeObservation.
   *
   * @param target Element to be observed.
   */
  constructor(target: Element) {
    this.target = target;
  }

  /**
   * Updates content rectangle and tells whether it's width or height properties
   * have changed since the last broadcast.
   */
  isActive(): boolean {
    const rect = getContentRect(this.target);

    this.contentRect_ = rect;

    return (
        rect.width !== this.broadcastWidth ||
        rect.height !== this.broadcastHeight);
  }

  /**
   * Updates 'broadcastWidth' and 'broadcastHeight' properties with a data
   * from the corresponding properties of the last observed content rectangle.
   *
   * @returns Last observed content rectangle.
   */
  broadcastRect(): DOMRectInit {
    const rect = this.contentRect_;

    this.broadcastWidth = rect.width;
    this.broadcastHeight = rect.height;

    return rect;
  }
}
