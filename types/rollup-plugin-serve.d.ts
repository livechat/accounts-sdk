// rollup-plugin-serve ships an index.d.ts, but its package.json "exports" map
// doesn't expose it, so TypeScript can't resolve the module's types (TS7016).
// Mirror of the essential public signature from the package's own index.d.ts.
declare module 'rollup-plugin-serve' {
  import {Plugin} from 'rollup';
  import {Server} from 'http';
  import {ServerOptions} from 'https';

  export interface RollupServeOptions {
    open?: boolean;
    openPage?: string;
    verbose?: boolean;
    contentBase?: string | string[];
    historyApiFallback?: boolean | string;
    host?: string;
    port?: number | string;
    https?: ServerOptions;
    headers?: {[name: string]: number | string | ReadonlyArray<string>};
    mimeTypes?: {[key: string]: string[]};
    onListening?: (server: Server) => void;
  }

  export default function serve(options?: RollupServeOptions | string): Plugin;
}
