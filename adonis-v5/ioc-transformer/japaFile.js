require('@kubit/require-ts/build/register')

const { configure } = require('japa')

configure({
  files: ['test/**/*.spec.ts'],
})
