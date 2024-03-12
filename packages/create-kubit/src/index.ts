#!/usr/bin/env node

import { program } from './program';

program(process.argv.slice(2), process.cwd()).catch(console.error);
