declare module '@ioc:Kubit/Event' {
  import { DbQueryEventNode } from '@ioc:Kubit/Lucid/Database';

  interface EventsList {
    'db:query': DbQueryEventNode;
  }
}
