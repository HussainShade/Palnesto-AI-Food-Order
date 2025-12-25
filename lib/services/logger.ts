/**
 * Structured logging service for observability
 * Provides consistent logging format for performance monitoring and debugging
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...context,
    };

    // In production, you'd send this to a logging service (e.g., Datadog, CloudWatch)
    if (level === 'error') {
      console.error(JSON.stringify(logEntry));
    } else if (level === 'warn') {
      console.warn(JSON.stringify(logEntry));
    } else {
      console.log(JSON.stringify(logEntry));
    }
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, context?: LogContext) {
    this.log('error', message, context);
  }

  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, context);
    }
  }

  /**
   * Log slow database queries
   */
  slowQuery(query: string, duration: number, context?: LogContext) {
    if (duration > 1000) {
      this.warn('Slow database query detected', {
        query,
        durationMs: duration,
        ...context,
      });
    }
  }

  /**
   * Log transaction events
   */
  transaction(event: 'start' | 'commit' | 'rollback', duration?: number, context?: LogContext) {
    const message = `Transaction ${event}`;
    if (duration !== undefined) {
      this.info(message, {
        durationMs: duration,
        ...context,
      });
    } else {
      this.debug(message, context);
    }
  }

  /**
   * Log request timing
   */
  requestTiming(operation: string, duration: number, context?: LogContext) {
    this.info('Request completed', {
      operation,
      durationMs: duration,
      ...context,
    });
  }
}

export const logger = new Logger();

