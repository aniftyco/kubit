const klaw = require('klaw')
const { join, sep } = require('path')
const { readFile, writeFile } = require('fs-extra')

const BASE_DIR = join(__dirname, '..')

/**
 * Ensures the path is for a task directory
 */
function isAllowed (itemPath) {
  if (itemPath === BASE_DIR) {
    return false
  }

  const tokens = itemPath.split(sep)
  return ['node_modules', '.git', 'bin', 'init', 'utils'].indexOf(tokens[tokens.length - 1]) === -1
}

/**
 * Scans for all directories that have mrm tasks. Later we
 * read `README.md` files from them and each task must
 * have readme file
 */
function scanTasksDirs () {
  return new Promise((resolve, reject) => {
    const tasksDirs = []

    klaw(BASE_DIR, { depthLimit: 0 })
      .on('data', (item) => {
        if (item.stats.isDirectory() && isAllowed(item.path)) {
          tasksDirs.push(item.path)
        }
      })
      .on('end', () => resolve(tasksDirs))
      .on('error', reject)
  })
}

function getReadmeContents (taskDir) {
  return readFile(join(taskDir, 'README.md'), 'utf-8')
}

async function patchReadmeFile (tasksDocs) {
  const readmeFile = await readFile(join(BASE_DIR, 'README.md'), 'utf-8')
  const [mainFile] = readmeFile.split('<!-- TASKS START -->')

  const newContents = [
    mainFile,
    '<!-- TASKS START -->',
    '\n',
    '<!-- DO NOT MODIFY MANUALLY. INSTEAD RUN `npm run docs` TO REGENERATE IT -->',
    '\n',
    '\n',
    tasksDocs.join('\n'),
    '\n',
    '<!-- TASKS END -->'
  ]

  await writeFile(join(BASE_DIR, 'README.md'), newContents.join(''))
}

scanTasksDirs()
  .then((tasksDirs) => {
    return Promise.all(tasksDirs.map(getReadmeContents))
  })
  .then(patchReadmeFile)
  .then(() => {
    console.log('done')
    process.exit(0)
  })
  .catch((error) => {
    console.log(error.message)
    process.exit(1)
  })
