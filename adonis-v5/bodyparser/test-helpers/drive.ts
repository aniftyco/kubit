declare module '@ioc:Kubit/Drive' {
  interface DisksList {
    local: {
      implementation: LocalDriverContract
      config: LocalDriverConfig
    }
  }
}
