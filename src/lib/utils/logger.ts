type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const LOG_LEVELS: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };
const currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function log(level: LogLevel, source: string, message: string, metadata?: Record<string, unknown>): void {
  if (!shouldLog(level)) return;
  const ts = new Date().toISOString();
  const meta = metadata && Object.keys(metadata).length > 0 ? ' ' + JSON.stringify(metadata) : '';
  const line = `[${ts}] [${level.toUpperCase()}] [${source}] ${message}${meta}`;
  switch (level) {
    case 'error': console.error(line); break;
    case 'warn': console.warn(line); break;
    case 'debug': console.debug(line); break;
    default: console.log(line);
  }
}

export function logAPIRequest(route: string, method: string, status: number, durationMs: number, metadata?: Record<string, unknown>): void {
  const level: LogLevel = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
  log(level, 'api:' + route, method + ' ' + status, { duration: durationMs, ...metadata });
}

export function logLLMCall(model: string, durationMs: number, success: boolean, cached: boolean, metadata?: Record<string, unknown>): void {
  const status = success ? 'OK' : 'FAIL';
  const cacheStr = cached ? ' (cached)' : '';
  log(success ? 'info' : 'error', 'llm', status + ' ' + model + cacheStr, { duration: durationMs, cached, ...metadata });
}

export function logInfo(source: string, message: string, metadata?: Record<string, unknown>): void {
  log('info', source, message, metadata);
}

export function logWarn(source: string, message: string, metadata?: Record<string, unknown>): void {
  log('warn', source, message, metadata);
}

export function logError(source: string, message: string, metadata?: Record<string, unknown>): void {
  log('error', source, message, metadata);
}

export async function timed<T>(source: string, fn: () => Promise<T>, successMessage?: string, metadata?: Record<string, unknown>): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    log('info', source, successMessage || 'Completed', { duration: Date.now() - start, ...metadata });
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    log('error', source, 'Failed: ' + (error instanceof Error ? error.message : String(error)), { duration, ...metadata });
    throw error;
  }
}
