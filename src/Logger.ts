
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

  constructor(readonly level: LogLevel, private readonly formatter?: FormatterSupplier) {
    if (!formatter) {
      this.formatter = e => '\x1b[30;1m' + e.date.toISOString() + '\x1b[0m ' +
        e.pid + ' ' + e.level + ' | ' + e.message
    }
  }

  debug(message?: any, ...args: any[]) {
    if (this.level <= LogLevel.Debug)
      console.log(this.build(LogLevel.Debug, message), ...args)
  }

  info(message?: any, ...args: any[]) {
    if (this.level <= LogLevel.Info)
      console.log(this.build(LogLevel.Info, message), ...args)
  }

  warn(message?: any, ...args: any[]) {
    if (this.level <= LogLevel.Warn)
      console.log(this.build(LogLevel.Warn, message), ...args)
  }

  error(message?: any, ...args: any[]) {
    if (this.level <= LogLevel.Error)
      console.error(this.build(LogLevel.Error, message), ...args)
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
