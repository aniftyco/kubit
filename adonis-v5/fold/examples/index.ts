// import { IocContract } from '../src/Contracts'

// type Bindings = {
//   'Kubit/Server': { http: true }
//   'Kubit/Request': { url: string }
// }
// const ioc = {} as IocContract<Bindings>

// ioc.bind('Kubit/Request', () => {
//   return {
//     url: '/',
//   }
// })

// ioc.fake('Kubit/Request', (container, originalValue) => {
//   return {
//     url: '/',
//   }
// })

// ioc.use('foo')

// ioc.fake('Kubit/Request', () => {
//   return {
//     url: '/',
//   }
// })

// ioc.use('Kubit/Request').url
// ioc.use({ namespace: 'Kubit/Request', type: 'binding' }).url

// ioc.make('Kubit/Request').url
// ioc.make({ namespace: 'Kubit/Request', type: 'binding' }).url

// class Foo {
//   public foo = 'foo'
//   public run() {}
//   public walk() {}
// }

// class FooPlain {
//   public static makePlain: true = true
//   public foo = 'foo'
// }

// ioc.make('Kubit/Request').url
// ioc.make(Foo).foo
// ioc.make(FooPlain).makePlain

// ioc.hasFake('Kubit/Request')
// ioc.hasFake('foo')

// ioc.hasBinding('Kubit/Request')
// ioc.hasBinding('foo')

// ioc.with(['Kubit/Request', 'foo'], (req, foo) => {
//   req.url
//   foo
// })

// ioc.call(ioc.make(Foo), 'run', [])
