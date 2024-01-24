/*
 * @adonisjs/require-ts
 *
 * (c) Harminder Virk <virk@adonisjs.comharminder@cav.ai>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import tsStatic from 'typescript'

/**
 * Exposes the API to report/print typescript diagnostic reports
 */
export class DiagnosticsReporter {
  /**
   * Diagnostics host
   */
  private host = {
    getNewLine: () => this.ts.sys.newLine,
    getCurrentDirectory: () => this.appRoot,
    getCanonicalFileName: this.ts.sys.useCaseSensitiveFileNames
      ? (fileName: string) => fileName
      : (fileName: string) => fileName.toLowerCase(),
  }

  constructor(private appRoot: string, private ts: typeof tsStatic, private pretty: boolean) {}

  public report(diagnostics: tsStatic.Diagnostic[]) {
    if (!diagnostics.length) {
      return
    }

    if (this.pretty) {
      console.log(this.ts.formatDiagnosticsWithColorAndContext(diagnostics, this.host))
    } else {
      console.log(this.ts.formatDiagnostics(diagnostics, this.host))
    }
  }
}
