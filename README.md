# debug-fabulous

**Lazy-evaluation wrapper for [`debug`](https://github.com/debug-js/debug) — skip string building entirely when logging is disabled.**

[![npm version](https://img.shields.io/npm/v/debug-fabulous.svg)](https://www.npmjs.com/package/debug-fabulous)
[![npm downloads](https://img.shields.io/npm/dw/debug-fabulous.svg)](https://www.npmjs.com/package/debug-fabulous)
[![tests](https://github.com/brickhouse-tech/debug-fabulous/actions/workflows/tests.yml/badge.svg)](https://github.com/brickhouse-tech/debug-fabulous/actions/workflows/tests.yml)

## Why?

The `debug` module always evaluates its arguments, even when the namespace is disabled. If you're building expensive strings — JSON serialization, large object inspection, string concatenation — you pay the cost even when nobody's reading the output.

**debug-fabulous** wraps `debug` with lazy evaluation. Pass a function instead of a string, and it only runs when the namespace is actually enabled. When logging is off, the call is a no-op — no string allocation, no concatenation, no wasted cycles.

This matters at scale. Libraries like [`gulp-sourcemaps`](https://www.npmjs.com/package/gulp-sourcemaps) (700K+ weekly downloads) use debug-fabulous as a transitive dependency for exactly this reason.

## Install

```bash
npm install debug-fabulous
```

## Quick Start

```js
const debugFab = require('debug-fabulous');
const debug = debugFab()('my-app');

// Lazy evaluation — the function only runs if 'my-app' is enabled
debug(() => 'user object: ' + JSON.stringify(largeUserObject));

// Plain strings still work
debug('server started on port %d', 3000);
```

### Spawning Child Debuggers

Create hierarchical namespaces without string juggling:

```js
const debugFab = require('debug-fabulous');
const debug = debugFab()('my-app');

const dbDebug = debug.spawn('db');       // my-app:db
const queryDebug = dbDebug.spawn('query'); // my-app:db:query

dbDebug('connected');
queryDebug(() => `SELECT took ${ms}ms, returned ${rows.length} rows`);
```

### Standalone Spawnable

If you just need hierarchical debuggers without the factory:

```js
const { spawnable } = require('debug-fabulous');
const debug = spawnable('my-app');

const child = debug.spawn('worker');  // my-app:worker
child('processing job %d', jobId);
```

## TypeScript

debug-fabulous is written in TypeScript and ships type declarations.

```ts
import debugFab, { spawnable } from 'debug-fabulous';

const debug = debugFab()('my-app');

// Lazy eval with type safety
debug(() => `processed ${items.length} items`);

// Spawn children
const child = debug.spawn('worker');
child('ready');

// Return an array for format strings
debug(() => ['found %d results in %dms', count, elapsed]);
```

## API

### `debugFab(debugApi?)`

Returns a wrapped `debug` factory with lazy evaluation and namespace caching.

- **`debugApi`** *(optional)* — a custom `debug` instance. Defaults to `require('debug')`.

The returned factory has the same API as `debug` (`enable()`, `disable()`, `load()`, `save()`, etc.) plus lazy evaluation support.

### `debug(fn)` — Lazy Evaluation

Pass a function instead of a string. It's only called when the namespace is enabled:

```js
// Function returns a string
debug(() => expensiveStringOperation());

// Function returns [formatter, ...args] array
debug(() => ['user %s performed %d actions', userName, count]);
```

### `debug.spawn(namespace)`

Creates a child debugger under the current namespace:

```js
const root = debug('app');       // app
const db = root.spawn('db');     // app:db
const cache = db.spawn('cache'); // app:db:cache
```

### `spawnable(namespace, debugFabFactory?)`

Standalone function that creates a spawnable debugger directly:

```js
const { spawnable } = require('debug-fabulous');
const debug = spawnable('app');
```

## How It Works

1. **Namespace caching** — `Map`-based memoization means repeated `debug('same-ns')` calls return the same instance instantly.
2. **Singleton no-op** — Disabled namespaces get a shared no-op function instead of allocating per-instance.
3. **Lazy closures** — When you pass a function, it's never invoked if the namespace is disabled. No string allocation, no concatenation, no `JSON.stringify()`.

## License

[MIT](./LICENSE) — Nicholas McCready and [contributors](https://github.com/brickhouse-tech/debug-fabulous/graphs/contributors).
