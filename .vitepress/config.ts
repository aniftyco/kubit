import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vitepress';

import type { DefaultTheme } from 'vitepress';

const { version } = JSON.parse(readFileSync(resolve(__dirname, '../packages/kubit/package.json'), 'utf-8'));

export default defineConfig({
  srcDir: './docs',
  cacheDir: './.vitepress/.cache',
  title: 'Kubit',
  description: 'Full stack framework for building applications in Node.js ',
  lastUpdated: true,
  cleanUrls: true,
  metaChunk: true,
  themeConfig: {
    siteTitle: false,
    logo: {
      light: '/logo-light.svg',
      dark: '/logo-dark.svg',
    },
    editLink: {
      pattern: 'https://github.com/aniftyco/kubit/edit/master/docs/:path',
      text: 'Edit this page on GitHub',
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/aniftyco/kubit' }],
    search: {
      provider: 'local',
    },
    nav: [
      {
        text: 'Guide',
        items: [
          { text: 'Introduction', link: '/guide/introduction' },
          { text: 'Installation', link: '/guide/installation' },
          { text: 'Fundamentals', link: '/guide/application' },
          { text: 'HTTP', link: '/guide/context' },
          { text: 'Views & Templates', link: '/guide/views' },
          { text: 'Validator', link: '/guide/validator' },
          { text: 'Database', link: '/guide/database' },
          { text: 'ORM', link: '/guide/orm' },
          { text: 'Authentication', link: '/guide/authentication' },
          { text: 'Security', link: '/guide/security' },
          { text: 'Testing', link: '/guide/testing' },
          { text: 'Digging Deeper', link: '/guide/authorization' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'Database', link: '/reference/database/connection-manager' },
          { text: 'Validator', link: '/reference/validator/schema/string' },
          { text: 'Views & Templates', link: '/reference/views/globals/inspect' },
          { text: 'Internationalization', link: '/reference/i18n/manager' },
        ],
      },
      {
        text: 'Ecosystem',
        items: [
          { text: 'Attachments', link: '/packages/attachments' },
          { text: 'Open Graph', link: '/packages/og' },
          { text: 'Notifications', link: '/packages/sse' },
        ],
      },
      {
        text: `v${version}`,
        items: [
          { text: 'Changelog', link: 'https://github.com/aniftyco/kubit/releases' },
          { text: 'Contributing', link: 'https://github.com/aniftyco/kubit/blob/master/.github/CONTRIBUTING.md' },
        ],
      },
    ],

    sidebar: {
      '/guide/': { base: '/guide/', items: sidebarGuide() },
      '/reference/database/': { base: '/reference/database/', items: sidebarReference('database') },
      '/reference/validator/': { base: '/reference/validator/', items: sidebarReference('validator') },
      '/reference/views/': { base: '/reference/views/', items: sidebarReference('views') },
      '/reference/i18n/': { base: '/reference/i18n/', items: sidebarReference('i18n') },
    },
  },
});

function sidebarGuide(): DefaultTheme.SidebarItem[] {
  return [
    { text: 'Introduction', link: 'introduction' },
    { text: 'Installation', link: 'installation' },
    {
      text: 'Fundamentals',
      collapsed: false,
      items: [
        { text: 'Application', link: 'application' },
        { text: 'Config', link: 'config' },
        { text: 'Environment Variables', link: 'env' },
        { text: 'TypeScript Build Process', link: 'typescript' },
        { text: 'Deployment', link: 'deployment' },
        { text: 'Async Local Storage', link: 'async-local-storage' },
      ],
    },
    {
      text: 'HTTP',
      collapsed: true,
      items: [
        { text: 'Context', link: 'context' },
        { text: 'Routing', link: 'routing' },
        { text: 'Controllers', link: 'controllers' },
        { text: 'Request', link: 'request' },
        { text: 'Response', link: 'response' },
        { text: 'File Uploads', link: 'uploads' },
        { text: 'Direct File Uploads', link: 'direct-uploads' },
        { text: 'Middleware', link: 'middleware' },
        { text: 'Cookies', link: 'cookies' },
        { text: 'Session', link: 'session' },
        { text: 'Static Assets', link: 'static' },
        { text: 'Assets Manager', link: 'assets' },
        { text: 'Exception Handling', link: 'exceptions' },
      ],
    },
    {
      text: 'Views & Templates',
      collapsed: true,
      items: [
        { text: 'Introduction', link: 'views' },
        { text: 'Rendering', link: 'rendering' },
        { text: 'Template Syntax', link: 'syntax' },
        { text: 'Data Flow', link: 'data-flow' },
        { text: 'Conditionals', link: 'conditionals' },
        { text: 'Loops', link: 'loops' },
        { text: 'Partials', link: 'partials' },
        { text: 'Layouts', link: 'layouts' },
        { text: 'Components', link: 'components' },
        { text: 'Mutations', link: 'mutations' },
        { text: 'Debugging', link: 'debugging' },
      ],
    },
    {
      text: 'Validator',
      collapsed: true,
      items: [
        { text: 'Introduction', link: 'validator' },
        { text: 'Custom Messages', link: 'messages' },
        { text: 'Error Reporters', link: 'reporters' },
        { text: 'Schema Caching', link: 'schema' },
        { text: 'Custom Validation Rules', link: 'rules' },
      ],
    },
    {
      text: 'Database',
      collapsed: true,
      items: [
        { text: 'Introduction', link: 'database' },
        { text: 'Query Builder', link: 'query-builder' },
        { text: 'Transactions', link: 'transactions' },
        { text: 'Pagination', link: 'pagination' },
        { text: 'Schema Migrations', link: 'migrations' },
        { text: 'Database Seeders', link: 'seeders' },
        { text: 'Debugging', link: 'debugging' },
      ],
    },
    {
      text: 'ORM',
      collapsed: true,
      items: [
        { text: 'Introduction', link: 'orm' },
        { text: 'CRUD Operations', link: 'crud' },
        { text: 'Hooks', link: 'hooks' },
        { text: 'Query Scopes', link: 'scopes' },
        { text: 'Serializing Models', link: 'serialization' },
        { text: 'Relationships', link: 'relationships' },
        { text: 'Model Factories', link: 'factories' },
      ],
    },
    {
      text: 'Authentication',
      collapsed: true,
      items: [
        { text: 'Introduction', link: 'authentication' },
        { text: 'Web Guard', link: 'web-guard' },
        { text: 'API Tokens', link: 'api-tokens' },
        { text: 'Basic Auth', link: 'basic-auth' },
        { text: 'Auth Middleware', link: 'auth-middleware' },
        { text: 'Social Authentication', link: 'social-authentication' },
        { text: 'Custom User Provider', link: 'custom-user-provider' },
      ],
    },
    {
      text: 'Security',
      collapsed: true,
      items: [
        { text: 'Web Security', link: 'security' },
        { text: 'CORS', link: 'cors' },
        { text: 'Encryption', link: 'encryption' },
        { text: 'Hashing', link: 'hashing' },
        { text: 'Signed URLs', link: 'signed-urls' },
      ],
    },
    {
      text: 'Testing',
      collapsed: true,
      items: [
        { text: 'Introduction', link: 'testing' },
        { text: 'HTTP Tests', link: 'http-tests' },
        { text: 'Mocking & Fakes', link: 'mocking' },
      ],
    },
    {
      text: 'Digging Deeper',
      collapsed: true,
      items: [
        { text: 'Authorization', link: 'authorization' },
        { text: 'Drive', link: 'drive' },
        { text: 'Internationalization', link: 'i18n' },
        { text: 'Console', link: 'console' },
        { text: 'REPL', link: 'repl' },
        { text: 'Logger', link: 'logger' },
        { text: 'Events', link: 'events' },
        { text: 'Helpers', link: 'helpers' },
        { text: 'Mailer', link: 'mailer' },
        { text: 'Redis', link: 'redis' },
        { text: 'Scheduler', link: 'scheduler' },
        { text: 'Queue', link: 'queue' },
        { text: 'Cache', link: 'cache' },
        { text: 'Health Check', link: 'health-check' },
        { text: 'Rate Limiting', link: 'rate-limiting' },
        { text: 'Route Model Binding', link: 'route-model-binding' },
      ],
    },
  ];
}

function sidebarReference(ref: 'database' | 'validator' | 'views' | 'i18n'): DefaultTheme.SidebarItem[] {
  switch (ref) {
    case 'database': {
      return [
        {
          text: 'Connection',
          collapsed: false,
          items: [
            { text: 'Connection Manager', link: 'database/connection-manager' },
            { text: 'Query Builder', link: 'database/query-builder' },
            { text: 'Insert Query Builder', link: 'database/insert-query-builder' },
            { text: 'Raw Query Builder', link: 'database/raw-query-builder' },
            { text: 'Query Client', link: 'database/query-client' },
            { text: 'Transaction Client', link: 'database/transaction-client' },
            { text: 'Database', link: 'database/database' },
            { text: 'Schema', link: 'database/schema' },
            { text: 'Schema Builder', link: 'database/schema-builder' },
            { text: 'Table Builder', link: 'database/table-builder' },
          ],
        },
        {
          text: 'ORM',
          collapsed: false,
          items: [
            { text: 'Base Model', link: 'database/base-model' },
            { text: 'Naming Strategy', link: 'database/naming-strategy' },
            { text: 'Query Builder', link: 'database/query-builder' },
            { text: 'Decorators', link: 'database/decorators' },
            { text: 'Adapter', link: 'database/adapter' },
          ],
        },
        {
          text: 'Relationships',
          collapsed: false,
          items: [
            { text: 'Has One', link: 'database/has-one' },
            { text: 'Has Many', link: 'database/has-many' },
            { text: 'Belongs To', link: 'database/belongs-to' },
            { text: 'Belongs To Many', link: 'database/belongs-to-many' },
            { text: 'Has Many Through', link: 'database/has-many-through' },
          ],
        },
      ];
    }
    case 'validator': {
      return [
        {
          text: 'Schema Types',
          collapsed: false,
          items: [
            { text: 'String', link: 'schema/string' },
            { text: 'Boolean', link: 'schema/boolean' },
            { text: 'Number', link: 'schema/number' },
            { text: 'Date', link: 'schema/date' },
            { text: 'Enum/EnumSet', link: 'schema/enum' },
            { text: 'File', link: 'schema/file' },
            { text: 'Array', link: 'schema/array' },
            { text: 'Object', link: 'schema/object' },
          ],
        },
        {
          text: 'Validation Rules',
          collapsed: false,
          items: [
            { text: 'Alpha', link: 'rules/alpha' },
            { text: 'Alpha Numeric', link: 'rules/alphanum' },
            { text: 'Confirmed', link: 'rules/confirmed' },
            { text: 'Distinct', link: 'rules/distinct' },
            { text: 'Email', link: 'rules/email' },
            { text: 'Exists', link: 'rules/exists' },
            { text: 'Unique', link: 'rules/unique' },
            { text: 'IP', link: 'rules/ip' },
            { text: 'Max Length', link: 'rules/maxlength' },
            { text: 'Min Length', link: 'rules/minlength' },
            { text: 'Range', link: 'rules/range' },
            { text: 'Regular Expression', link: 'rules/regex' },
            { text: 'UUID', link: 'rules/uuid' },
            { text: 'Mobile', link: 'rules/mobile' },
            { text: 'Required If', link: 'rules/requiredif' },
            { text: 'After', link: 'rules/after' },
            { text: 'Before', link: 'rules/before' },
            { text: 'After Field', link: 'rules/afterfield' },
            { text: 'Before Field', link: 'rules/beforefield' },
            { text: 'Not In', link: 'rules/notin' },
            { text: 'URL', link: 'rules/url' },
            { text: 'Equal To', link: 'rules/equalto' },
            { text: 'Escape', link: 'rules/escape' },
            { text: 'Trim', link: 'rules/trim' },
          ],
        },
      ];
    }
    case 'views': {
      return [
        {
          text: 'Globals',
          collapsed: false,
          items: [
            { text: 'Inspect', link: 'globals/inspect' },
            { text: 'Truncate', link: 'globals/truncate' },
            { text: 'Excerpt', link: 'globals/excerpt' },
            { text: 'Safe', link: 'globals/safe' },
            { text: 'Route / Signed Route', link: 'globals/route' },
            { text: 'Flash Messages', link: 'globals/flash-messages' },
            { text: 'Session', link: 'globals/session' },
            { text: 'Stringify', link: 'globals/stringify' },
            { text: 'String Helpers', link: 'globals/string-helpers' },
            { text: 'All Other Helpers', link: 'globals/all-other-helpers' },
          ],
        },
        {
          text: 'Tags',
          collapsed: false,
          items: [
            { text: 'Component / Slot / Inject', link: 'tags/component' },
            { text: 'Debugger', link: 'tags/debugger' },
            { text: 'Each', link: 'tags/each' },
            { text: 'If / Else If / Else', link: 'tags/conditionals' },
            { text: 'Include / Include If', link: 'tags/include' },
            { text: 'Layout / Section / Super', link: 'tags/layout' },
            { text: 'Set', link: 'tags/set' },
            { text: 'Can / Cannot', link: 'tags/can' },
            { text: 'Entry Points', link: 'tags/entry-points' },
          ],
        },
      ];
    }
    case 'i18n': {
      return [];
    }
    default:
      return [];
  }
}
