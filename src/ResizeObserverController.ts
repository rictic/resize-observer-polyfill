import ResizeObserverSPI from './ResizeObserverSPI.js';
import isBrowser from './utils/isBrowser.js';
import throttle from './utils/throttle.js';

// Minimum delay before invoking the update of observers.
const REFRESH_DELAY = 20;

// A list of substrings of CSS properties used to find transition events that
// might affect dimensions of observed elements.
const transitionKeys =
    ['top', 'right', 'bottom', 'left', 'width', 'height', 'size', 'weight'] as
    const;

// Check if MutationObserver is available.
const mutationObserverSupported = typeof MutationObserver !== 'undefined';

// Get the native implementation of HTMLElement.attachShadow
const origAttachShadow = (
  isBrowser && HTMLElement.prototype.attachShadow &&
  HTMLElement.prototype.attachShadow.toString().indexOf('[native code]') !== -1
) ? HTMLElement.prototype.attachShadow : null;

/**
 * Singleton controller class which handles updates of ResizeObserver instances.
 */
export default class ResizeObserverController {
  /**
   * Indicates whether DOM listeners have been added.
   */
  private connected_ = false;

  /**
   * Tells that controller has subscribed for Mutation Events.
   */
  private mutationEventsAdded_ = false;

  /**
   * Keeps reference to the instance of MutationObserver.
   */
  private mutationsObserver_: MutationObserver|null = null;

  /**
   * A list of connected observers.
   */
  private observers_: ResizeObserverSPI[] = [];

  /**
   * Holds reference to the controller's instance.
   */
  static instance_: ResizeObserverController|null = null;

  /**
   * Creates a new instance of ResizeObserverController.
   */
  private constructor() {
    this.onTransitionEnd_ = this.onTransitionEnd_.bind(this);
    this.refresh = throttle(this.refresh.bind(this), REFRESH_DELAY);
  }

  /**
   * Adds observer to observers list.
   *
   * @param observer Observer to be added.
   */
  addObserver(observer: ResizeObserverSPI) {
    if (!~this.observers_.indexOf(observer)) {
      this.observers_.push(observer);
    }

    // Add listeners if they haven't been added yet.
    if (!this.connected_) {
      this.connect_();
    }
  }

  /**
   * Removes observer from observers list.
   *
   * @param observer Observer to be removed.
   */
  removeObserver(observer: ResizeObserverSPI) {
    const observers = this.observers_;
    const index = observers.indexOf(observer);

    // Remove observer if it's present in registry.
    if (~index) {
      observers.splice(index, 1);
    }

    // Remove listeners if controller has no connected observers.
    if (!observers.length && this.connected_) {
      this.disconnect_();
    }
  }

  /**
   * Invokes the update of observers. It will continue running updates insofar
   * it detects changes.
   */
  refresh() {
    const changesDetected = this.updateObservers_();

    // Continue running updates if changes have been detected as there might
    // be future ones caused by CSS transitions.
    if (changesDetected) {
      this.refresh();
    }
  }

  /**
   * Updates every observer from observers list and notifies them of queued
   * entries.
   *
   * @returns Returns "true" if any observer has detected changes in
   *      dimensions of it's elements.
   */
  private updateObservers_(): boolean {
    // Collect observers that have active observations.
    const activeObservers = this.observers_.filter(observer => {
      return observer.gatherActive(), observer.hasActive();
    });

    // Deliver notifications in a separate cycle in order to avoid any
    // collisions between observers, e.g. when multiple instances of
    // ResizeObserver are tracking the same element and the callback of one
    // of them changes content dimensions of the observed target. Sometimes
    // this may result in notifications being blocked for the rest of observers.
    activeObservers.forEach(observer => observer.broadcastActive());

    return activeObservers.length > 0;
  }

  /**
   * Initializes DOM listeners.
   */
  private connect_() {
    // Do nothing if running in a non-browser environment or if listeners
    // have been already added.
    if (!isBrowser || this.connected_) {
      return;
    }

    // Subscription to the "Transitionend" event is used as a workaround for
    // delayed transitions. This way it's possible to capture at least the
    // final state of an element.
    document.addEventListener('transitionend', this.onTransitionEnd_);

    window.addEventListener('resize', this.refresh);

    if (mutationObserverSupported) {
      this.mutationsObserver_ = new MutationObserver(this.refresh);
      const options = {
          attributes: true,
          childList: true,
          characterData: true,
          subtree: true
      };

      this.mutationsObserver_.observe(document, options);

      if (origAttachShadow) {
          const controller = this;

          (function observeExistingShadowRoots(node: Element | ShadowRoot) {
              const shadowRoot = (node as Element).shadowRoot;
              if (shadowRoot) {
                  controller.mutationsObserver_!.observe(shadowRoot, options);
                  observeExistingShadowRoots(shadowRoot);
              }
              let child = node.firstElementChild;
              while (child) {
                  observeExistingShadowRoots(child);
                  child = child.nextElementSibling;
              }
          })(document as unknown as Element);

          HTMLElement.prototype.attachShadow = function (...args) {
              const shadowRoot =  origAttachShadow.apply(this, args);
              controller.mutationsObserver_!.observe(shadowRoot, options);
              return shadowRoot;
          }
      }
} else {
      document.addEventListener('DOMSubtreeModified', this.refresh);

      this.mutationEventsAdded_ = true;
    }

    this.connected_ = true;
  }

  /**
   * Removes DOM listeners.
   */
  private disconnect_() {
    // Do nothing if running in a non-browser environment or if listeners
    // have been already removed.
    if (!isBrowser || !this.connected_) {
      return;
    }

    document.removeEventListener('transitionend', this.onTransitionEnd_);
    window.removeEventListener('resize', this.refresh);

    if (this.mutationsObserver_) {
      this.mutationsObserver_.disconnect();

      if (origAttachShadow) {
        HTMLElement.prototype.attachShadow = origAttachShadow;
      }
    }

    if (this.mutationEventsAdded_) {
      document.removeEventListener('DOMSubtreeModified', this.refresh);
    }

    this.mutationsObserver_ = null;
    this.mutationEventsAdded_ = false;
    this.connected_ = false;
  }

  /**
   * "Transitionend" event handler.
   */
  private onTransitionEnd_({propertyName = ''}: TransitionEvent) {
    // Detect whether transition may affect dimensions of an element.
    const isReflowProperty = transitionKeys.some(key => {
      return !!~propertyName.indexOf(key);
    });

    if (isReflowProperty) {
      this.refresh();
    }
  }

  /**
   * Returns instance of the ResizeObserverController.
   */
  static getInstance(): ResizeObserverController {
    if (!ResizeObserverController.instance_) {
      ResizeObserverController.instance_ = new ResizeObserverController();
    }

    return ResizeObserverController.instance_;
  }
}
