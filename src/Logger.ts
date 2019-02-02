import chalk from 'chalk'
import * as proc from 'process'

const pid = chalk.yellowBright(proc.pid.toString())

interface Mark {
  debug: string
  info: string
  warn: string
  error: string
}

type Level = 'debug' | 'info' | 'warn' | 'error'

enum LevelCardinality {
  Debug,
  Info,
  Warn,
  Error
}

class Logger {

  public readonly mark: Mark
  public level: LevelCardinality

  constructor() {
    const appName = require(__dirname + "./../package.json").name;
    this.mark = {
      debug: chalk.greenBright(appName),
      info: chalk.blueBright(appName),
      warn: chalk.yellow(appName),
      error: chalk.redBright(appName)
    }
  }

  debug(message: string, ...args: any[]) {
    if (this.level <= LevelCardinality.Debug)
      this.log(message, this.mark.debug, ...args)
  }

  info(message: string, ...args: any[]) {
    if (this.level <= LevelCardinality.Info)
      this.log(message, this.mark.info, ...args)
  }

  warn(message: string, ...args: any[]) {
    if (this.level <= LevelCardinality.Warn)
      this.log(message, this.mark.warn, ...args)
  }

  error(message: string, ...args: any[]) {
    if (this.level <= LevelCardinality.Error)
      this.log(message, this.mark.error, ...args)
  }

  private log(message: string, mark: string, ...args) {
    const time = new Date().toISOString()
    console.log(`${time} ${pid} ${mark} ${message}`, ...args)
  }
}

const instance = new Logger()

function createLoggerInstance(appName: string, level?: Level): Logger {
  instance.mark.debug = chalk.greenBright(appName)
  instance.mark.info = chalk.blueBright(appName)
  instance.mark.warn = chalk.yellow(appName)
  instance.mark.error = chalk.redBright(appName)
  instance.level = getLevelCardinality(level)
  return instance
}

function getLevelCardinality(level: Level): LevelCardinality {
  const i = ['debug', 'info', 'warn', 'error'].indexOf(level)
  return i > -1 ? i : LevelCardinality.Error
}

export default createLoggerInstance
