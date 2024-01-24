declare module '@ioc:Adonis/Core/Event' {
  interface EventsList {
    'new:user': { id: number }
    'delete:user': { id: number; eventId: string }
  }
}
