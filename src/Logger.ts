
import { inspect } from 'util'

const pid = process.pid.toString()

export enum LogLevel {
  Debug = 0,
  Info = 1,
  Warn = 2,
  Error = 3
}

export interface LogEntry {
  date: Date
  pid: string
  level: string
  message: string
}

const levels = [
  '\x1b[32mDEBUG\x1b[0m',
  '\x1b[36mINFO \x1b[0m',
  '\x1b[33mWARN \x1b[0m',
  '\x1b[41mERROR\x1b[0m'
]

export type FormatterSupplier = (e: LogEntry) => string

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
      this.formatter = e => '\x1b[30;1m' + e.date.toISOString() + '\x1b[0m ' +
        e.pid + ' ' + e.level + ' | ' + e.message
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

  private inspect(arg: any): any {
    return this._inspect ? inspect(arg, false, this._inspectDepth, true) : arg
  }

  private build(level: LogLevel, message?: any): string {
    return this.formatter({
      date: new Date(),
      level: levels[level],
      pid,
      message
    })
  }
}
