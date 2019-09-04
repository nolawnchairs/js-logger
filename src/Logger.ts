import chalk from 'chalk'
import * as proc from 'process'

const pid = chalk.yellowBright(proc.pid.toString())

// interface Mark {
//   debug: string
//   info: string
//   warn: string
//   error: string
// }

interface Mark {
  debug: (text: string) => string
  info: (text: string) => string
  warn: (text: string) => string
  error: (text: string) => string
}


type Level = 'debug' | 'info' | 'warn' | 'error'

export interface Options {
  printLevel?: 'full' | 'initial'
}


enum LevelCardinality {
  Debug,
  Info,
  Warn,
  Error
}

const colors: Mark = {
  debug: chalk.greenBright,
  info: chalk.blueBright,
  warn: chalk.yellowBright,
  error: chalk.redBright
}

class Logger {

  private _appName: string
  private _level: LevelCardinality
  private _options: Options

  set appName(appName: string) { this._appName = appName }
  set level(level: LevelCardinality) { this._level = level }
  set options(options: Options) { this._options = options }

  debug(message: string, ...args: any[]) {
    if (this._level <= LevelCardinality.Debug)
      this.log(message, 'debug', ...args)
  }

  info(message: string, ...args: any[]) {
    if (this._level <= LevelCardinality.Info)
      this.log(message, 'info', ...args)
  }

  warn(message: string, ...args: any[]) {
    if (this._level <= LevelCardinality.Warn)
      this.log(message, 'warn', ...args)
  }

  error(message: string, ...args: any[]) {
    if (this._level <= LevelCardinality.Error)
      this.log(message, 'error', ...args)
  }

  private markColor(level: Level, text: string): string {
    return colors[level](text)
  }

  private getLevelMark(level: Level) {
    if (this._options.printLevel) {
      if (this._options.printLevel == 'full') {
        return this.markColor(level, strpad(level.toUpperCase(), 5))
      }
      return this.markColor(level, level.toUpperCase().charAt(0))
    }
  }

  private log(message: string, level: Level, ...args: any[]) {
    const time = new Date().toISOString()
    const appName = this.markColor(level, this._appName)
    const levelMark = this.getLevelMark(level)
    const items = [
      time,
      pid,
      levelMark,
      appName,
      message
    ]

    console.log(items.filter(i => !!i).join(' '), ...args)
  }
}

const instance = new Logger()

function createLoggerInstance(appName: string, level: Level, options?: Options): Logger {
  instance.appName = appName
  instance.level = getLevelCardinality(level)
  instance.options = { ...options }
  return instance
}

function strpad(text: string, size: number): string {
  let s = text
  while (s.length < size) s = s + ' ';
  return s;
}

function getLevelCardinality(level: Level): LevelCardinality {
  const i = ['debug', 'info', 'warn', 'error'].indexOf(level)
  return i > -1 ? i : LevelCardinality.Error
}

export default createLoggerInstance
