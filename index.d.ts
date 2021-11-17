// Generated by dts-bundle-generator v5.9.0

/// <reference types="node" />

import { WriteStream } from 'fs';

export declare enum LogLevel {
  DEBUG = 1,
  INFO = 2,
  WARN = 4,
  ERROR = 8,
  FATAL = 16
}
export interface LogEntry {
  date: Date;
  pid: string;
  level: LogLevel;
  levelText: string;
  levelColor: AnsiColors;
  message: string;
  context?: string;
}
export declare enum AnsiColors {
  RESET = "\u001B[0m",
  BLACK = "\u001B[30m",
  GRAY = "\u001B[30;1m",
  WHITE = "\u001B[37m",
  RED = "\u001B[31m",
  GREEN = "\u001B[32m",
  YELLOW = "\u001B[33m",
  BLUE = "\u001B[34m",
  MAGENTA = "\u001B[35m",
  CYAN = "\u001B[36m",
  BRIGHT_RED = "\u001B[31;1m",
  BRIGHT_GREEN = "\u001B[32;1m",
  BRIGHT_YELLOW = "\u001B[33;1m",
  BRIGHT_BLUE = "\u001B[34;1m",
  BRIGHT_MAGENTA = "\u001B[35;1m",
  BRIGHT_CYAN = "\u001B[36;1m",
  BRIGHT_WHITE = "\u001B[37;1m",
  BRIGHT_BLACK = "\u001B[30;1m",
  BG_BRIGHT_RED = "\u001B[41;1m"
}
export declare type FormatProvider = (e: LogEntry) => string;
export declare namespace Formatters {
  function createLogEntry(level: LogLevel, message: string, context?: string): LogEntry;
  function colorize(color: AnsiColors, text: string): string;
  /**
   * The default formatter, ex:
   * 2021-11-17T08:52:09.126Z 16880  INFO | Testing Info
   *
   * @export
   * @param {LogEntry} e
   * @return {*}  {string}
   */
  function defaultFormatter(e: LogEntry): string;
  /**
   * Formatter that outputs the same format as the default formatter,
   * but with no ANSI colors, ex:
   * 2021-11-17T08:52:09.126Z 16880  INFO | Testing Info
   *
   * @export
   * @param {LogEntry} e
   * @return {*}  {string}
   */
  function monochromeFormatter(e: LogEntry): string;
  /**
   * Formatter that serializes each log entry into JSON. Useful
   * for file loggers.
   *
   * @export
   * @param {LogEntry} e
   * @return {*}  {string}
   */
  function jsonFormatter(e: LogEntry): string;
}
export declare type WriterInterface = WriteStream | NodeJS.WriteStream;
export declare type Provider = () => Promise<WriterInterface>;
export interface WriterOptions {
  /**
   * The formatter provider for this writer
   *
   * @type {FormatProvider}
   * @memberof WriterOptions
   */
  formatter?: FormatProvider;
}
export declare type FileWriterOptions = WriterOptions & {
  /**
   * The CHMOD valid for the file on octal format. Defaults to 644 (0o644)
   *
   * @type {number}
   */
  mode?: number;
  /**
   * The encoding. Defaults to utf-8
   *
   * @type {BufferEncoding}
   */
  encoding?: BufferEncoding;
};
export declare class LogWriter {
  private writerProvider;
  private _writer;
  private _formatter;
  constructor(writerProvider: Provider, options?: WriterOptions);
  /**
   * Creates a new LogWriter instance that prints to stdout
   *
   * @static
   * @param {WriterOptions} options
   * @return {*}  {LogWriter}
   * @memberof LogWriter
   */
  static stdout(options: WriterOptions): LogWriter;
  /**
   * Creates a new LogWriter instance that prints to stderr
   *
   * @static
   * @param {WriterOptions} options
   * @return {*}  {LogWriter}
   * @memberof LogWriter
   */
  static stderr(options: WriterOptions): LogWriter;
  /**
   * Creates a new LogWriter instance that dumps to a file
   *
   * @static
   * @param {WriterOptions} options
   * @return {*}  {LogWriter}
   * @memberof LogWriter
   */
  static file(filePath: string, options?: FileWriterOptions): LogWriter;
  get formatter(): FormatProvider;
  /**
   * Sets the formatter for this writer
   *
   * @param {FormatProvider} formatter
   * @memberof LogWriter
   */
  setFormatter(formatter: FormatProvider): void;
  /**
   * Writes the output to the writable stream
   *
   * @param {string} value
   * @memberof LogWriter
   */
  write(value: string): Promise<void>;
}
export declare type LoggerInstanceConfigProvider = (value: string) => LoggerInstanceConfig;
export interface LoggerGlobalConfig {
  /**
   * The end-of-line character. Defaults to \n
   *
   * @type {string}
   * @memberof LoggerGlobalConfig
   */
  eol?: string;
  /**
   * The formatter provider. This will be the formatter that serves
   * as the default for any writers that do not define their own
   *
   * @type {FormatProvider}
   * @memberof LoggerGlobalConfig
   */
  formatter?: FormatProvider;
  /**
   * Defines the depth of object inspection (how many nested objects get printed)
   * when printing objects to the console or file. If an object has nested objects or
   * arrays that are nested deeper than this setting, they will print as '[object Object]'
   * and 'element1,element2', respectively. Defaults to 3
   *
   * @type {number}
   * @memberof LoggerGlobalConfig
   */
  inspectionDepth?: number;
  /**
   * Whether or not to add ANSI color to the inspected nested objects and arrays.
   * This should only be set for console loggers and not file loggers. Defaults to false
   *
   * @type {boolean}
   * @memberof LoggerGlobalConfig
   */
  inspectionColor?: boolean;
  /**
   * Defines the strategy by which arrays and objects are serialized to the output
   * Defaults to ObjectSerializationStrategy.INSPECT
   *
   * @type {ObjectSerializationStrategy}
   * @memberof LoggerGlobalConfig
   */
  serializationStrategy?: ObjectSerializationStrategy;
  /**
   * Whether or not to print failed assertions. Defaults to true
   *
   * @type {boolean}
   * @memberof LoggerGlobalConfig
   */
  assertionsEnabled?: boolean;
  /**
   * Which logging level to use for printing failed assertions
   *
   * @type {LogLevel}
   * @memberof LoggerGlobalConfig
   */
  assertionLevel?: LogLevel;
}
export interface LoggerConfig {
  global?: LoggerGlobalConfig;
  providers: {
    globalLoggers: Record<string, LoggerInstanceConfigProvider>;
    featureLogger?: LoggerInstanceConfigProvider;
  };
}
export interface LoggerInstanceConfig extends LoggerGlobalConfig {
  /**
   * Whether or not this logger is enabled
   *
   * @type {boolean}
   * @memberof LoggerInstanceConfig
   */
  enabled: boolean;
  /**
   * The logging level to use. Supply a single LogLevel value and the logger
   * will print all logs from the supplied level, UP. LogLevels are ordered by
   * the severity: DEBUG, INFO, WARN, ERROR and FATAL. Choosing WARN will enable
   * WARN, ERROR and FATAL.
   *
   * You can also OR multiple levels together to form a bitmask and the logger will
   * print only those levels. LogLevel.INFO | LogLevel.ERROR will only print logs
   * for only those two levels
   *
   * To print ALL levels, use the provided constant LEVELS_ALL
   *
   * @type {(LogLevel | number)}
   * @memberof LoggerInstanceConfig
   */
  level: LogLevel | number;
  /**
   * An array of LogWriter instances to use with this logger
   *
   * @type {LogWriter[]}
   * @memberof LoggerInstanceConfig
   */
  writers: LogWriter[];
}
export declare enum ObjectSerializationStrategy {
  /**
   * Omits the value from the message all together
   */
  OMIT = 0,
  /**
   * Serializes the value to JSON
   */
  JSON = 1,
  /**
   * Outputs an inspection of the value with a default
   * depth of 3. This option outputs the same as the console.log
   * and console.error functions in Node. Useful for console
   * output, less so for files where JSON should be preferred
   */
  INSPECT = 2
}
export interface Logger {
  /**
   * Prints a DEBUG level log
   *
   * @param {*} message the message
   * @param {...any[]} args the arguments to append to the message, or to inject into the message if using sprintf syntax
   * @memberof Logger
   */
  debug(message: any, ...args: any[]): void;
  /**
   * Prints an INFO level log
   *
   * @param {*} message the message
   * @param {...any[]} args the arguments to append to the message, or to inject into the message if using sprintf syntax
   * @memberof Logger
   */
  info(message: any, ...args: any[]): void;
  /**
   * Prints a WARN level log
   *
   * @param {*} message the message
   * @param {...any[]} args the arguments to append to the message, or to inject into the message if using sprintf syntax
   * @memberof Logger
   */
  warn(message: any, ...args: any[]): void;
  /**
   * Prints an ERROR level log
   *
   * @param {*} message the message
   * @param {...any[]} args the arguments to append to the message, or to inject into the message if using sprintf syntax
   * @memberof Logger
   */
  error(message: any, ...args: any[]): void;
  /**
   * Prints a FATAL level log
   *
   * @param {*} message the message
   * @param {...any[]} args the arguments to append to the message, or to inject into the message if using sprintf syntax
   * @memberof Logger
   */
  fatal(message: any, ...args: any[]): void;
  /**
   * Prints an assertion to the log
   *
   * @param {boolean} condition
   * @param {*} message
   * @param {...any[]} args
   * @memberof Logger
   */
  assert(condition: boolean, message: any, ...args: any[]): void;
}
declare class DefaultLogger implements Logger {
  private globalConfig;
  private featureLoggerTemplate;
  /**
   * Initializes the logging service
   *
   * @param {LoggerConfig} config the configuration for the logging service
   * @memberof DefaultLogger
   */
  init(config: LoggerConfig): void;
  /**
   * Initializes a logging instance for a specific feature of your application
   *
   * @param {string} context the context for this logger, such as a class name or module name
   * @param {LoggerInstanceConfig} [config] the optional configuration for this instance. If not provided, will inherit the default logger config defined in the init method under the featureLoggers property
   * @return {*}  {Logger}
   * @memberof DefaultLogger
   */
  forFeature(context: string, config?: LoggerInstanceConfig): Logger;
  debug(message: any, ...args: any[]): void;
  info(message: any, ...args: any[]): void;
  warn(message: any, ...args: any[]): void;
  error(message: any, ...args: any[]): void;
  fatal(message: any, ...args: any[]): void;
  assert(condition: boolean, message: any, ...args: any[]): void;
}
declare const defaultLogger: DefaultLogger;
export declare const LEVELS_ALL = 31;

export {
  defaultLogger as Log,
};

