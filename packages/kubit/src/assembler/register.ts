import register from './requireHook';

register(process.env.KUBIT_CONSOLE_CWD || process.cwd());
