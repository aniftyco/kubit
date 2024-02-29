import log from 'mrm-core/src/util/log';

/**
 * Overwriting mrm logger to have support for custom log messages
 */
function noop() {}
log.info = noop;
log.removed = noop;
log.added = noop;
