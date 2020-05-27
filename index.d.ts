export declare enum LogLevel {
  Debug = 0,
  Info = 1,
  Warn = 2,
  Error = 3
}
export declare class Logger {
  readonly level: LogLevel;
  constructor(level: LogLevel, formatter?: FormatterSupplier);
  debug(message?: any, ...args: any[]): void;
  info(message?: any, ...args: any[]): void;
  warn(message?: any, ...args: any[]): void;
  error(message?: any, ...args: any[]): void;
}

export declare interface LogEntry {
  date: string
  pid: string
  level: string
  message: string
}
declare type FormatterSupplier = (e: LogEntry) => string