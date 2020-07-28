import ResizeObserverController from './ResizeObserverController.js';
import ResizeObserverSPI from './ResizeObserverSPI.js';

/**
 * ResizeObserver API. Encapsulates the ResizeObserver SPI implementation
 * exposing only those methods and properties that are defined in the spec.
 */
class ResizeObserver {
  private readonly observer_: ResizeObserverSPI;

  /**
   * Creates a new instance of ResizeObserver.
   *
   * @param callback Callback that is invoked when dimensions of the observed
   *     elements change.
   */
  constructor(callback: ResizeObserverCallback) {
    if (!(this instanceof ResizeObserver)) {
      throw new TypeError('Cannot call a class as a function.');
    }
    if (!arguments.length) {
      throw new TypeError('1 argument required, but only 0 present.');
    }

    const controller = ResizeObserverController.getInstance();
    this.observer_ = new ResizeObserverSPI(callback, controller, this);
  }

  observe(target: Element): void {
    this.observer_.observe(target);
  }

  unobserve(target: Element): void {
    this.observer_.unobserve(target);
  }
  disconnect(): void {
    this.observer_.disconnect();
  }
}

export default ResizeObserver;
