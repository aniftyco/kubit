import Event from '@ioc:Adonis/Core/Event'

Event.on('another:user', (data) => {
  data.id
})

Event.on('new:user', () => {})

Event.emit('new:user', { id: 10 })
// Event.emit('new:user', { id: '10' })
Event.emit('another:user', { id: '10' })
Event.off('new:user', () => {})

Event.onAny((event, data) => {
  if (event === 'delete:user') {
    console.log(data)
  }
})
