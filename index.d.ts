export declare enum LogLevel {
  Debug = 0,
  Info = 1,
  Warn = 2,
  Error = 3
}
export declare class Logger {
  readonly level: LogLevel;
  /**
   * Creates an instance of Logger
   * 
   * @param {LogLevel} level the logging level
   * @param {FormatterSupplier} [formatter] the output formatter
   * @memberof Logger
   */
  constructor(level: LogLevel, formatter?: FormatterSupplier);
  /**
   * Emit a debug message to stdout
   *
   * @param {*} [message] the message
   * @param {...any[]} args additional arguments
   * @memberof Logger
   */
  debug(message?: any, ...args: any[]): void;
  /**
   * Emit an info message to stdout
   *
   * @param {*} [message] the message
   * @param {...any[]} args additional arguments
   * @memberof Logger
   */
  info(message?: any, ...args: any[]): void;
  /**
   * Emit a warning message to stdout
   *
   * @param {*} [message] the message
   * @param {...any[]} args additional arguments
   * @memberof Logger
   */
  warn(message?: any, ...args: any[]): void;
  /**
   * Emit an error message to stderr
   *
   * @param {*} [message] the message
   * @param {...any[]} args additional arguments
   * @memberof Logger
   */
  error(message?: any, ...args: any[]): void;
  /**
   * Clones the instance of the current logger with
   * one that will inspect nested arrays and objects
   *
   * @param {number} [depth] the depth to inspect. default null (entire depth)
   * @returns {Logger} the new logger instance
   * @memberof Logger
   */
  expand(depth?: number): Logger
}

export declare interface LogEntry {
  date: string
  pid: string
  level: string
  message: string
}
declare type FormatterSupplier = (e: LogEntry) => string