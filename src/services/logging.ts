import { toast } from 'react-hot-toast';

type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'trace';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
  trace?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 1000;

  private log(level: LogLevel, message: string, data?: any) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
      trace: new Error().stack
    };

    this.logs.push(entry);
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift();
    }

    // Always console log in development
    if (import.meta.env.DEV) {
      console[level](message, data || '', entry.trace || '');
    }

    return entry;
  }

  trace(message: string, data?: any) {
    return this.log('trace', message, data);
  }

  info(message: string, data?: any) {
    return this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    return this.log('warn', message, data);
  }

  error(message: string, error?: any) {
    const entry = this.log('error', message, {
      error: error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: error.stack
      } : error
    });
    toast.error(message);
    return entry;
  }

  debug(message: string, data?: any) {
    if (import.meta.env.DEV) {
      return this.log('debug', message, data);
    }
  }

  getLogs(level?: LogLevel) {
    return level 
      ? this.logs.filter(log => log.level === level)
      : [...this.logs];
  }

  getRecentLogs(count: number = 50) {
    return this.logs.slice(-count);
  }

  clearLogs() {
    this.logs = [];
  }

  // Get logs for a specific user session
  getSessionLogs(userId: string) {
    return this.logs.filter(log => 
      log.data?.userId === userId || 
      log.data?.user?.id === userId
    );
  }

  // Get auth-related logs
  getAuthLogs() {
    return this.logs.filter(log => 
      log.message.toLowerCase().includes('auth') ||
      log.message.toLowerCase().includes('login') ||
      log.message.toLowerCase().includes('logout') ||
      log.message.toLowerCase().includes('session')
    );
  }
}

export const logger = new Logger();