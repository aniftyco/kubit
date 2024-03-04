declare module '@ioc:Kubit/Application' {
  import { EncryptionContract } from '@ioc:Kubit/Encryption';

  export interface ContainerBindings {
    'Kubit/Encryption': EncryptionContract;
  }
}
