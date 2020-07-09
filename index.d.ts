
export declare enum LogLevel {
  Debug = 0,
  Info = 1,
  Warn = 2,
  Error = 3
}

declare type FormatterSupplier = (e: LogEntry, colorizers: Colorizers) => string
export declare class Logger {
  readonly level: LogLevel
  /**
   * Creates an instance of Logger
   * 
   * @param {LogLevel} level the logging level
   * @param {FormatterSupplier} [formatter] the output formatter
   * @memberof Logger
   */
  constructor(level: LogLevel, formatter?: FormatterSupplier)

  /**
   * Prints a debug message to stdout
   *
   * @param {*} [message] the message
   * @param {...any[]} args additional arguments
   * @memberof Logger
   */
  debug(message?: any, ...args: any[]): void

  /**
   * Prints an info message to stdout
   *
   * @param {*} [message] the message
   * @param {...any[]} args additional arguments
   * @memberof Logger
   */
  info(message?: any, ...args: any[]): void

  /**
   * Prints a warning message to stdout
   *
   * @param {*} [message] the message
   * @param {...any[]} args additional arguments
   * @memberof Logger
   */
  warn(message?: any, ...args: any[]): void

  /**
   * Prints an error message to stderr
   *
   * @param {*} [message] the message
   * @param {...any[]} args additional arguments
   * @memberof Logger
   */
  error(message?: any, ...args: any[]): void

  /**
   * Clones the instance of the current logger with
   * one that will inspect nested arrays and objects
   *
   * @param {number} [depth] the depth to inspect. default null (entire depth)
   * @returns {Logger} the new logger instance
   * @memberof Logger
   */
  expand(depth?: number): Logger

  /**
   * Clones the instance of the current logger with
   * one that will print any level regardless of the level
   * set by default
   *
   * @returns {Logger} the new logger instance
   * @memberof Logger
   */
  force(): Logger
}

export declare interface Colorizers {
  /**
   * Prints text in ANSI green (default color for DEBUG)
   * 
   * @param {string} text the text
   * @returns {string} the ANSI-colorized text
   */
  green: (text: string) => string

  /**
   * Prints text in ANSI cyan (default color for INFO)
   * 
   * @param {string} text the text
   * @returns {string} the ANSI-colorized text
   */
  cyan: (text: string) => string

  /**
   * Prints text in ANSI yellow (default for WARN)
   * 
   * @param {string} text the text
   * @returns {string} the ANSI-colorized text
   */
  yellow: (text: string) => string

  /**
   * Prints text in ANSI red (default for ERROR)
   * 
   * @param {string} text the text
   * @returns {string} the ANSI-colorized text
   */
  red: (text: string) => string

  /**
   * Prints text in ANSI grey (default for the Date)
   * 
   * @param {string} text the text
   * @returns {string} the ANSI-colorized text
   */
  grey: (text: string) => string

  /**
   * Prints text in a custom color
   * 
   * @param {string} text the text
   * @param {string} ansiValue the numeric part of the ANSI code for the color desired (e.g. 41 or 30;1)
   * @returns {string} the ANSI-colorized text
   */
  custom: (text: string, ansiValue: string) => string

  /**
   * Prints text using the default color for the given
   * level.
   * @param {LogLevel} level the level
   * @param {string} [text] the text to print. Defaults to the string value of provided level
   * @returns {string} the ANSI-colorized text
   */
  levelDefault: (level: LogLevel, text?: string) => string
}

export declare interface LogEntry {
  /**
   * The JS Date object noting the time of the message
   */
  date: Date

  /**
   * The process ID in string format
   */
  pid: string

  /**
   * The LogLevel of the message
   */
  level: LogLevel

  /**
   * The string representation of the LogLevel. The INFO and WARN
   * strings are end-padded with a space for symmetry with ERROR
   * and DEBUG
   */
  levelValue: string

  /**
   * The formatted message to print
   */
  message: string
}