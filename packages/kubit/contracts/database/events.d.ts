declare module '@ioc:Kubit/Event' {
  import { DbQueryEventNode } from '@ioc:Kubit/Database';

  interface EventsList {
    'db:query': DbQueryEventNode;
  }
}
