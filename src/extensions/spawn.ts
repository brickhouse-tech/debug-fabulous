import { Debugger } from 'debug';
import { DebuggerExtSpawn, DebugFabulous } from '../internals';
import debugFabFactoryFn from '../debugFabFactory';

// Lazy-initialize to avoid circular dependency issues at module load time
let defaultFactory: DebugFabulous | null = null;
const getDefaultFactory = (): DebugFabulous => {
  if (!defaultFactory) {
    defaultFactory = debugFabFactoryFn() as DebugFabulous;
  }
  return defaultFactory;
};

export default function spawnFactory(
  namespace: string = '',
  debugFabFactory?: DebugFabulous,
): DebuggerExtSpawn {
  // Use provided factory or lazily initialize default
  const factory = debugFabFactory ?? getDefaultFactory();

  function createDebugger(base: string = '', ns: string = ''): DebuggerExtSpawn {
    const newNs = ns ? [base, ns].join(':') : base;
    const debug = factory(newNs) as DebuggerExtSpawn;

    debug.spawn = spawn;
    return debug;
  }

  function spawn(this: Debugger, ns: string) {
    return createDebugger(this.namespace, ns);
  }

  return createDebugger(namespace);
}
