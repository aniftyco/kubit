import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as TablerIcons from '@tabler/icons-react';
import { readFileSync, mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as Kubit from '../react/dist/index.js';

/**
 * Render every visual case as a standalone HTML page, mirroring render-blade.php.
 *
 * Both stacks emit into the same build directory and link the same compiled
 * stylesheet, which is what makes a pixel diff attributable to structure rather
 * than to two different CSS builds.
 */
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cases = resolve(root, 'tests/visual/cases');
const out = resolve(root, 'tests/visual/build/react');

mkdirSync(out, { recursive: true });

/**
 * The shipped React components take a Tabler icon component, while the shared case
 * JSON names icons as strings — the format Blade consumes directly. Resolving a
 * name to its Tabler component here keeps that mapping a fixture-only concern
 * rather than shipping it in the library.
 */
const ICON_NAME_PROPS = new Set(['icon', 'iconTrailing']);

const iconComponentFor = (name) => {
  const exportName =
    'Icon' +
    name
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');

  const component = TablerIcons[exportName];

  if (!component) {
    throw new Error(`No Tabler icon exported for name [${name}] (looked for ${exportName}).`);
  }

  return component;
};

const resolveIconProps = (props) => {
  const resolved = { ...props };

  for (const key of ICON_NAME_PROPS) {
    if (typeof resolved[key] === 'string') {
      resolved[key] = iconComponentFor(resolved[key]);
    }
  }

  return resolved;
};

const componentFor = (name) => {
  const exportName = name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

  const component = Kubit[exportName];

  if (!component) {
    throw new Error(`No React component exported for case file [${name}.json] (looked for ${exportName}).`);
  }

  return component;
};

const page = (markup) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="../fixture.css">
</head>
<body class="bg-surface p-8">
  <div data-kubit-case class="inline-block">${markup}</div>
</body>
</html>
`;

for (const file of readdirSync(cases).filter((f) => f.endsWith('.json'))) {
  const name = basename(file, '.json');
  const Component = componentFor(name);

  for (const testCase of JSON.parse(readFileSync(resolve(cases, file), 'utf8'))) {
    const { children, ...props } = { ...resolveIconProps(testCase.props ?? {}), children: testCase.slot || undefined };

    const markup = renderToStaticMarkup(createElement(Component, props, children));

    writeFileSync(resolve(out, `${name}--${testCase.name}.html`), page(markup));

    console.log(`react: ${name}--${testCase.name}`);
  }
}
