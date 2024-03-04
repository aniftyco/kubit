declare module '@ioc:Kubit/Static' {
  import { Stats } from 'fs';

  export type AssetsConfig = {
    enabled: boolean;
    acceptRanges?: boolean;
    cacheControl?: boolean;
    dotFiles?: 'ignore' | 'allow' | 'deny';
    etag?: boolean;
    lastModified?: boolean;
    maxAge?: number | string;
    immutable?: boolean;
    headers?: (path: string, stats: Stats) => Record<string, any>;
  };
}
