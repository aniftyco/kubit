import { Suite } from 'benchmark'
import revisionHash from 'rev-hash'

const basePath = 'app/Http/Controllers/HomeController.ts'

function normalize() {
  const tokens = basePath.split('/')
  const fileName = tokens.pop()
  return `${tokens.join('-')}-${fileName!.replace(/\.\w+$/, '')}`
}

function hashFile() {
  return revisionHash(basePath)
}

new Suite()
  .add('md5 hash', () => {
    hashFile()
  })
  .add('normalize path', () => {
    normalize()
  })
  .on('cycle', function (event: any) {
    console.log(String(event.target))
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run({ async: true })
