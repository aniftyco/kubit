import igniculus from 'igniculus';
import { inspect } from 'util';

import { DbQueryEventNode } from '@ioc:Kubit/Database';

const illuminate = igniculus({
  comments: { fg: 'gray' },
  constants: { fg: 'red' },
  delimitedIdentifiers: { fg: 'yellow' },
  variables: { fg: 'cyan' },
  dataTypes: { fg: 'green', casing: 'uppercase' },
  standardKeywords: { fg: 'green', casing: 'uppercase' },
  lesserKeywords: { mode: 'bold', fg: 'cyan', casing: 'uppercase' },
  prefix: { replace: /.*?: / },
  output: (line: string) => line,
});

/**
 * Colorizes the sql query
 */
function colorizeQuery(sql: string) {
  return illuminate(sql);
}

/**
 * Pretty print queries
 */
export function prettyPrint(queryLog: DbQueryEventNode) {
  /**
   * Lazy loading pretty printed dependencies
   */
  const color = require('kleur');
  const prettyHrtime = require('pretty-hrtime');

  let output: string = '';

  if (!queryLog.ddl) {
    output += color.gray(`"${queryLog.connection}" `);
  }

  /**
   * Concatenate the model
   */
  if (queryLog.model) {
    output += `${queryLog.model} `;
  }

  /**
   * Concatenate the duration
   */
  if (queryLog.duration) {
    output += `(${prettyHrtime(queryLog.duration)}) `;
  }

  /**
   * Colorize query and bindings
   */
  output += colorizeQuery(queryLog.sql);

  if (!queryLog.ddl) {
    output += color.gray(` ${inspect(queryLog.bindings)}`);
  }

  /**
   * Print it to the console
   */
  console.log(output);
}
