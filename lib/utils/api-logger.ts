/**
 * API Logger for tracking API requests and performance
 */

interface LogOptions {
  source?: 'app-router' | 'pages-router' | 'compatibility-layer';
  method?: string;
  path?: string;
  status?: number;
  duration?: number;
  error?: Error | unknown;
}

class ApiLogger {
  private static instance: ApiLogger;
  private isDebugEnabled: boolean;
  
  private constructor() {
    this.isDebugEnabled = process.env.API_DEBUG === 'true';
  }
  
  public static getInstance(): ApiLogger {
    if (!ApiLogger.instance) {
      ApiLogger.instance = new ApiLogger();
    }
    
    return ApiLogger.instance;
  }
  
  public log(options: LogOptions): void {
    if (!this.isDebugEnabled) {
      return;
    }
    
    const { source, method, path, status, duration, error } = options;
    
    let logMessage = `[API${source ? `-${source}` : ''}]`;
    
    if (method) {
      logMessage += ` ${method}`;
    }
    
    if (path) {
      logMessage += ` ${path}`;
    }
    
    if (status) {
      const statusColor = this.getStatusColor(status);
      logMessage += ` Status: ${this.colorize(status.toString(), statusColor)}`;
    }
    
    if (duration) {
      const durationColor = this.getDurationColor(duration);
      logMessage += ` Duration: ${this.colorize(`${duration.toFixed(2)}ms`, durationColor)}`;
    }
    
    console.log(logMessage);
    
    if (error) {
      console.error(`[API-ERROR] ${error instanceof Error ? error.message : 'Unknown error'}`, error);
    }
  }
  
  private getStatusColor(status: number): string {
    if (status < 300) return 'green';
    if (status < 400) return 'blue';
    if (status < 500) return 'yellow';
    return 'red';
  }
  
  private getDurationColor(duration: number): string {
    if (duration < 100) return 'green';
    if (duration < 500) return 'blue';
    if (duration < 1000) return 'yellow';
    return 'red';
  }
  
  private colorize(text: string, color: string): string {
    if (process.env.NODE_ENV === 'production') {
      return text;
    }
    
    const colors = {
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      reset: '\x1b[0m',
    };
    
    return `${colors[color as keyof typeof colors]}${text}${colors.reset}`;
  }
}

export const apiLogger = ApiLogger.getInstance();

export default apiLogger;
