import { Debug, Debugger } from 'debug';
import { LazyDebugFunc } from '../internals';

/**
 * Singleton noop function - avoids creating new function on every disabled namespace call
 */
const NOOP: Debugger = (() => {}) as unknown as Debugger;

/**
 * Extends a debugger to support lazy evaluation via closures.
 * When a function is passed instead of a string, it's only evaluated
 * if the debugger is enabled.
 */
const extend = (_debugger: Debugger): Debugger => {
  const wrapped = (formatter: any, ...args: any[]) => {
    if (typeof formatter === 'function') {
      const ret = (formatter as LazyDebugFunc)();
      const toApply: any[] = Array.isArray(ret) ? ret : [ret];
      // @ts-ignore
      return _debugger(...toApply);
    }
    return _debugger(formatter, ...args);
  };

  // Copy all properties from the original debugger
  return Object.assign(wrapped, _debugger);
};

/**
 * Wraps the debug factory with lazy evaluation and memoization.
 * Uses a simple Map for caching - much lighter than memoizee (~2.3MB savings).
 */
const lazyEval = (debugInst: Debug): Debug => {
  const cache = new Map<string, Debugger>();

  function debug(namespace: string): Debugger {
    // Check cache first
    let cached = cache.get(namespace);
    if (cached !== undefined) {
      return cached;
    }

    const instance = debugInst(namespace);

    if (!instance.enabled) {
      // Use singleton noop with instance properties for disabled namespaces
      cached = Object.assign(NOOP, instance);
    } else {
      cached = extend(instance);
    }

    cache.set(namespace, cached);
    return cached;
  }

  // Copy debug API methods (enable, disable, etc.) to our wrapped function
  return Object.assign(debug, debugInst) as Debug;
};

export default lazyEval;
