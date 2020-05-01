/**
 * A collection of shims that provide minimal functionality of the ES6
 * collections.
 *
 * These implementations are not meant to be used outside of the ResizeObserver
 * modules as they cover only a limited range of use cases.
 */
/* eslint-disable require-jsdoc, valid-jsdoc */
const MapShim =
    (() => {
      if (typeof Map !== 'undefined') {
        return Map;
      }

      /**
       * Returns index in provided array that matches the specified key.
       */
      function getIndex<T>(arr: Array<[T, unknown]>, key: T): number {
        let result = -1;

        arr.some((entry, index) => {
          if (entry[0] === key) {
            result = index;

            return true;
          }

          return false;
        });

        return result;
      }

      return class<K, V> {
        __entries__: Array<[K, V]> = [];

        get size(): number {
          return this.__entries__.length;
        }

        get(key: K) {
          const index = getIndex(this.__entries__, key);
          return this.__entries__[index]?.[1];
        }

        set(key: K, value: V) {
          const index = getIndex(this.__entries__, key);

          if (~index) {
            this.__entries__[index][1] = value;
          } else {
            this.__entries__.push([key, value]);
          }
        }

        delete(key: K) {
          const entries = this.__entries__;
          const index = getIndex(entries, key);

          if (~index) {
            entries.splice(index, 1);
          }
        }

        has(key: K): boolean {
          return !!~getIndex(this.__entries__, key);
        }

        clear() {
          this.__entries__.splice(0);
        }

        forEach(callback: (value: V, key: K) => void, ctx = null) {
          for (const entry of this.__entries__) {
            callback.call(ctx, entry[1], entry[0]);
          }
        }
      };
    })() as unknown as typeof Map;

export {MapShim as Map};
