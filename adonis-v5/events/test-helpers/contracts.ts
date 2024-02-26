declare module '@ioc:Kubit/Event' {
  interface EventsList {
    'new:user': { id: number }
    'delete:user': { id: number; eventId: string }
  }
}
