/*
 * @adonisjs/require-ts
 *
 * (c) Harminder Virk <virk@adonisjs.comharminder@cav.ai>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import testConsole from 'test-console'

export function stringToArray(value: string) {
  return value.split('\n').map((line) => line.trim())
}

/**
 * Strip ANSI escape codes
 */
function stripAnsi(value: string) {
  const pattern = [
    '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
    '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))',
  ].join('|')
  return value.replace(RegExp(pattern, 'g'), '')
}

export function inspectConsole() {
  const stdoutOutput = testConsole.stdout.inspect()
  const stderrOutput = testConsole.stderr.inspect()
  return () => {
    stdoutOutput.restore()
    stderrOutput.restore()
    return {
      stdout: stdoutOutput.output
        .map((line) => stripAnsi(line))
        .filter((line) => !line.trim().includes('adonis:require-ts')),
      stderr: stderrOutput.output
        .map((line) => stripAnsi(line))
        .filter((line) => !line.trim().includes('adonis:require-ts')),
    }
  }
}
