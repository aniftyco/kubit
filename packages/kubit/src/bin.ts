#!/usr/bin/env node
import 'reflect-metadata';

import sourceMapSupport from 'source-map-support';

import { Ignitor } from '@adonisjs/core/build/standalone';

sourceMapSupport.install({ handleUncaughtExceptions: false });

new Ignitor(process.cwd()).ace().handle(process.argv.slice(2));
