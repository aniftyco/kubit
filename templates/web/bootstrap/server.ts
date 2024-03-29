/*
|--------------------------------------------------------------------------
| AdonisJs Server
|--------------------------------------------------------------------------
|
| The contents in this file is meant to bootstrap the AdonisJs application
| and start the HTTP server to accept incoming connections. You must avoid
| making this file dirty and instead make use of `lifecycle hooks` provided
| by Kubit service providers for custom code.
|
*/

import 'reflect-metadata';

import { Ignitor } from 'kubit';
import { resolve } from 'path';
import sourceMapSupport from 'source-map-support';

sourceMapSupport.install({ handleUncaughtExceptions: false });

new Ignitor(resolve(__dirname, '../')).httpServer().start();
