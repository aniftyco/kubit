import Env from '@ioc:Kubit/Env'

const values = Env.rules({
  PORT: Env.schema.number(),
  HOST: Env.schema.string(),
  CACHE_VIEWS: Env.schema.boolean(),
  AUTH_GUARD: Env.schema.enum(['name', 'fii', 'sda'] as const),
})

console.log(values)
