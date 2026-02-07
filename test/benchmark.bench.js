/**
 * Performance benchmarks for debug-fabulous
 * 
 * Run with: npm run bench
 * 
 * These benchmarks measure:
 * 1. Cache lookup performance (repeated namespace access)
 * 2. Cache miss performance (new namespace creation)
 * 3. Disabled namespace overhead (should be near-zero)
 * 4. Enabled namespace with lazy evaluation
 * 5. Spawn performance for hierarchical debuggers
 * 6. Memory efficiency under load
 * 7. Lazy evaluation benefit (the main value-add of debug-fabulous)
 */

import { bench, describe } from 'vitest';
import debugFabFactory from '../lib/index.js';
import { spawnable } from '../lib/index.js';

// Suppress all debug output during benchmarks
const noop = () => {};

describe('debug-fabulous performance', () => {
  // === Setup for all benchmarks ===
  const debugFactory = debugFabFactory();
  
  // Pre-create disabled debugger
  debugFactory.disable();
  const disabledDebug = debugFactory('benchmark:disabled');
  
  // Pre-create enabled debugger with suppressed output
  debugFactory.enable('benchmark:enabled');
  const enabledDebug = debugFactory('benchmark:enabled');
  enabledDebug.log = noop;
  
  // Reset for other tests
  debugFactory.disable();

  // === Cache Performance ===
  describe('cache lookup', () => {
    bench('access same namespace 1000x', () => {
      for (let i = 0; i < 1000; i++) {
        debugFactory('benchmark:cached');
      }
    });
  });

  describe('cache miss', () => {
    let counter = 0;
    bench('create 100 unique namespaces', () => {
      for (let i = 0; i < 100; i++) {
        debugFactory(`benchmark:unique:${counter++}`);
      }
    });
  });

  // === Disabled Namespace (should be ~free) ===
  describe('disabled namespace overhead', () => {
    bench('disabled: string arg 1000x', () => {
      for (let i = 0; i < 1000; i++) {
        disabledDebug('test message');
      }
    });

    bench('disabled: lazy fn 1000x', () => {
      for (let i = 0; i < 1000; i++) {
        disabledDebug(() => 'test message with ' + 'concatenation');
      }
    });
  });

  // === Enabled Namespace Performance ===
  describe('enabled namespace', () => {
    bench('enabled: string arg 1000x', () => {
      for (let i = 0; i < 1000; i++) {
        enabledDebug('test message');
      }
    });

    bench('enabled: lazy fn 1000x', () => {
      for (let i = 0; i < 1000; i++) {
        enabledDebug(() => 'test message');
      }
    });

    bench('enabled: lazy fn + array args 1000x', () => {
      for (let i = 0; i < 1000; i++) {
        enabledDebug(() => ['test %s %d', 'message', i]);
      }
    });
  });

  // === Spawn Performance ===
  describe('spawn', () => {
    bench('spawn 100 child debuggers', () => {
      const root = spawnable('benchmark:spawn');
      for (let i = 0; i < 100; i++) {
        root.spawn(`child${i}`);
      }
    });

    bench('spawn 10-level deep hierarchy', () => {
      let current = spawnable('benchmark:deep');
      for (let i = 0; i < 10; i++) {
        current = current.spawn(`level${i}`);
      }
    });
  });

  // === Memory Efficiency ===
  describe('memory efficiency', () => {
    bench('create+use 1000 namespaces', () => {
      // Fresh factory with suppressed output
      const factory = debugFabFactory();
      factory.debug.log = noop; // Suppress before enabling
      factory.enable('mem:*');
      
      for (let i = 0; i < 1000; i++) {
        const debug = factory(`mem:namespace:${i}`);
        debug.log = noop;
        debug(() => `message ${i}`);
      }
    });
  });

  // === Lazy Evaluation Benefit (the key feature) ===
  describe('lazy evaluation benefit', () => {
    // This demonstrates why lazy evaluation matters:
    // When debugging is DISABLED, lazy functions prevent wasted work
    
    const expensiveData = { foo: 'bar', baz: [1, 2, 3], nested: { a: 1 } };
    
    bench('disabled: string concat (work wasted)', () => {
      for (let i = 0; i < 1000; i++) {
        disabledDebug('expensive: ' + JSON.stringify(expensiveData) + ' i=' + i);
      }
    });

    bench('disabled: lazy fn (work skipped)', () => {
      for (let i = 0; i < 1000; i++) {
        disabledDebug(() => 'expensive: ' + JSON.stringify(expensiveData) + ' i=' + i);
      }
    });
  });
});
