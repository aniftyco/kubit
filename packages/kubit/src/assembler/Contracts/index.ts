export type JapaFlags = Partial<{
  _: string[];
  '--tags': string[];
  '--ignore-tags': string[];
  '--files': string[];
  '--timeout': number;
  '--force-exit': boolean;
}>;
