
const pid = process.pid.toString()

export enum LogLevel {
  Debug = 0,
  Info = 1,
  Warn = 2,
  Error = 3
}

interface Components {
  date: string
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

export type FormatterSupplier = (components: Components) => string

export class Logger {

  constructor(readonly level: LogLevel, private readonly formatter?: FormatterSupplier) {
    if (!formatter) {
      this.formatter = c => '\x1b[30;1m' + c.date + '\x1b[0m ' +
        c.pid + ' ' + c.level + ' | ' + c.message
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
      date: new Date().toISOString(),
      level: levels[level],
      pid,
      message
    })
  }
}
