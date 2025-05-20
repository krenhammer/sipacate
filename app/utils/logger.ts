import { env } from 'process';

/**
 * Simple logging utility for the ui-mcp CLI tool.
 *
 * Supports log levels: debug, info, warn, error.
 * Log level is controlled by the LOG_LEVEL environment variable (default: 'info').
 * Usage: import { logger } from './logger'; logger.info('message');
 *
 * Note: This logger is intended for internal CLI and service use (debugging, diagnostics, workflow tracing),
 * not for user-facing output formatting.
 */

// Log levels in order of severity
const levels = ['debug', 'info', 'warn', 'error'] as const;
export type LogLevel = typeof levels[number];

function getLogLevel(): LogLevel {
  const LOG_LEVEL = (env.LOG_LEVEL || 'info').toLowerCase() as LogLevel;
  return levels.includes(LOG_LEVEL) ? LOG_LEVEL : 'info';
}

function shouldLog(level: LogLevel) {
  const currentLevelIdx = levels.indexOf(getLogLevel());
  return levels.indexOf(level) >= currentLevelIdx;
}

export const logger = {
  debug: (...args: any[]) => {
    if (shouldLog('debug')) console.debug('[DEBUG]', ...args);
  },
  info: (...args: any[]) => {
    if (shouldLog('info')) console.info('[INFO]', ...args);
  },
  warn: (...args: any[]) => {
    if (shouldLog('warn')) console.warn('[WARN]', ...args);
  },
  error: (...args: any[]) => {
    if (shouldLog('error')) console.error('[ERROR]', ...args);
  },
};

// Export log levels for testing
export const __logLevels = levels; 