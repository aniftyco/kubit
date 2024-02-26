declare module '@ioc:Kubit/Redis' {
  export interface RedisConnectionsList {
    primary: RedisConnectionConfig
    cluster: RedisClusterConfig
  }
}
