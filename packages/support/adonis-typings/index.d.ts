declare module '@ioc:Kubit/Support' {
  import type { LucidModel } from '@ioc:Adonis/Lucid/Orm';

  export interface UuidMixin {
    <T extends NormalizeConstructor<LucidModel>>(superclass: T): T;
  }

  export const UsesUuids: UuidMixin;
}

declare global {
  function view(path: string, state?: any): Promise<string>;
}
