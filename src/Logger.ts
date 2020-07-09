
import { inspect } from 'util'

const pid = process.pid.toString()

export enum LogLevel {
  Debug = 0,
  Info = 1,
  Warn = 2,
  Error = 3
}

// Log entry values
export interface LogEntry {
  date: Date
  pid: string
  levelValue: string
  level: LogLevel
  message: string
}

// Colorizer function definitions
type DefinedColorizer = (text: string) => string
type CustomColorizer = (text: string, ansiValue: string) => string
type LevelDefaultColorizer = (level: LogLevel, levelValue?: string) => string

// Colorizer interface
export interface Colorizers {
  green: DefinedColorizer
  cyan: DefinedColorizer
  yellow: DefinedColorizer
  red: DefinedColorizer
  grey: DefinedColorizer
  custom: CustomColorizer
  levelDefault: LevelDefaultColorizer
}

// Colorizers
const colorizers: Colorizers = {
  green: (text: string) => '\x1b[32m' + text + '\x1b[0m',
  cyan: (text: string) => '\x1b[36m' + text + '\x1b[0m',
  yellow: (text: string) => '\x1b[33m' + text + '\x1b[0m',
  red: (text: string) => '\x1b[41m' + text + '\x1b[0m',
  grey: (text: string) => '\x1b[30;1m' + text + '\x1b[0m',
  custom: (text: string, ansiValue: string) => {
    return '\x1b[' + ansiValue.toString() + 'm' + text + '\x1b[0m'
  },
  levelDefault: (level: LogLevel, text?: string) => {
    const [levelTextValue, levelColorizer] = levels[level]
    return levelColorizer(text || levelTextValue)
  }
}

// Level meta information
type LevelMeta = [string, DefinedColorizer]
const levels: LevelMeta[] = [
  ['DEBUG', colorizers.green],
  ['INFO ', colorizers.cyan],
  ['WARN ', colorizers.yellow],
  ['ERROR', colorizers.red],
]

// Formatter supplier function definition
export type FormatterSupplier = (e: LogEntry, colorizers: Colorizers) => string

export class Logger {

  private _inspect = false
  private _inspectDepth: number

  /**
   * Creates an instance of Logger
   * 
   * @param {LogLevel} level the logging level
   * @param {FormatterSupplier} [formatter] the output formatter
   * @memberof Logger
   */
  constructor(readonly level: LogLevel, private readonly formatter?: FormatterSupplier) {
    if (!formatter) {
      this.formatter = e => {
        const [levelValue, levelColorizer] = levels[e.level]
        return colorizers.grey(e.date.toISOString()) + ' ' +
          e.pid + ' ' + levelColorizer(levelValue) + ' | ' + e.message
      }
    }
  }

  /**
   * Emit a debug message to stdout
   * 
   * @param {*} [message] the message
   * @param {...any[]} args additional arguments
   * @memberof Logger
   */
  debug(message?: any, ...args: any[]) {
    if (this.level <= LogLevel.Debug)
      console.log(this.build(LogLevel.Debug, this.inspect(message)), ...args.map(a => this.inspect(a)))
  }

  /**
   * Emit an info message to stdout
   *
   * @param {*} [message] the message
   * @param {...any[]} args additional arguments
   * @memberof Logger
   */
  info(message?: any, ...args: any[]) {
    if (this.level <= LogLevel.Info)
      console.log(this.build(LogLevel.Info, this.inspect(message)), ...args.map(a => this.inspect(a)))
  }

  /**
   * Emit a warning message to stdout
   *
   * @param {*} [message] the message
   * @param {...any[]} args additional arguments
   * @memberof Logger
   */
  warn(message?: any, ...args: any[]) {
    if (this.level <= LogLevel.Warn)
      console.log(this.build(LogLevel.Warn, this.inspect(message)), ...args.map(a => this.inspect(a)))
  }

  /**
   * Emit an error message to stderr
   *
   * @param {*} [message] the message
   * @param {...any[]} args additional arguments
   * @memberof Logger
   */
  error(message?: any, ...args: any[]) {
    if (this.level <= LogLevel.Error)
      console.error(this.build(LogLevel.Error, this.inspect(message)), ...args.map(a => this.inspect(a)))
  }

  /**
   * Clones the instance of the current logger with
   * one that will inspect nested arrays and objects,
   *
   * @param {number} [depth] the depth to inspect. default null (entire depth)
   * @returns {Logger} the new logger instance
   * @memberof Logger
   */
  expand(depth?: number): Logger {
    const instance = new Logger(this.level, this.formatter)
    instance._inspect = true
    instance._inspectDepth = depth || null
    return instance
  }

  /**
   * Clones the instance of the current logger with
   * one that will print any level regardless of the level
   * set by default
   *
   * @returns {Logger} the new logger instance
   * @memberof Logger
   */
  force(): Logger {
    return new Logger(LogLevel.Debug, this.formatter)
  }

  private inspect(arg: any): any {
    return this._inspect ? inspect(arg, false, this._inspectDepth, true) : arg
  }

  /**
   * Builds the log message using the formatter supplied
   *
   * @private
   * @param {LogLevel} level the level to log
   * @param {*} [message] the message
   * @returns {string} the formatted message
   * @memberof Logger
   */
  private build(level: LogLevel, message?: any): string {
    const [levelValue] = levels[level]
    return this.formatter({
      date: new Date(),
      levelValue,
      level,
      pid,
      message
    }, colorizers)
  }
}
