
import { LoggerConfig, LoggerConfigInstance, LoggerConfigProvider, LoggerGlobalConfig } from './Config'
import { FormatProvider, Formatters, TextBuilder } from './Format'
import { LogLevel } from './LogLevel'
import { mergeOptions } from './Util'

interface Logger {
  debug(message: any, ...args: any[]): void
  info(message: any, ...args: any[]): void
  warn(message: any, ...args: any[]): void
  error(message: any, ...args: any[]): void
  fatal(message: any, ...args: any[]): void
}

const globalLoggers: Map<string, LogImpl> = new Map()
const defaultConfig: LoggerGlobalConfig = {
  inspectionColor: false,
  inspectionDepth: 3,
  eol: '\n',
  formatter: Formatters.defaultFormatter
}

class LoggerDefault implements Logger {

  private globalConfig: LoggerGlobalConfig = {}
  private featureLoggerTemplate: LoggerConfigProvider

  init(config: LoggerConfig) {
    if (!config)
      throw new Error('Configuration object must not be null or undefined')
    const { global = {}, providers } = config
    if (!providers)
      throw new Error('No "providers" object was supplied to Log::init')
    this.globalConfig = { ...defaultConfig, ...global }
    for (const logger of Object.keys(providers.globalLoggers)) {
      const config = providers.globalLoggers[logger](logger)
      const { eol, inspectionColor, inspectionDepth, ...rest } = config
      const instance = new LogImpl({
        config: {
          ...mergeOptions(this.globalConfig, { eol, inspectionColor, inspectionDepth }),
          ...rest
        },
      })
      globalLoggers.set(logger, instance)
    }

    if (providers.featureLogger) {
      this.featureLoggerTemplate = providers.featureLogger
    }
  }

  forFeature(name: string, config?: LoggerConfigInstance): LogImpl {
    let loggerConfig: LoggerConfigInstance
    if (!config) {
      if (!this.featureLoggerTemplate)
        throw new Error(`Named logger for '${name}' could not be initialized. No default configuration found`)
      loggerConfig = this.featureLoggerTemplate(name)
    }

    const { eol, inspectionColor, inspectionDepth, formatter, ...rest } = loggerConfig
    return new LogImpl({
      meta: name,
      config: {
        ...mergeOptions(this.globalConfig, { eol, inspectionColor, inspectionDepth, formatter }),
        ...rest
      },
    })
  }

  debug(message: any, ...args: any[]) {
    globalLoggers.forEach(log => log.debug(message, ...args))
  }

  info(message: any, ...args: any[]) {
    globalLoggers.forEach(log => log.info(message, ...args))
  }

  warn(message: any, ...args: any[]) {
    globalLoggers.forEach(log => log.warn(message, ...args))
  }

  error(message: any, ...args: any[]) {
    globalLoggers.forEach(log => log.error(message, ...args))
  }

  fatal(message: any, ...args: any[]) {
    globalLoggers.forEach(log => log.fatal(message, ...args))
  }
}

type LoggerProperties = {
  config: LoggerConfigInstance
  meta?: string
}

class LogImpl implements Logger {

  private config: LoggerConfigInstance
  private eol: string
  private formatter: FormatProvider
  private meta?: string

  constructor(properties: LoggerProperties) {
    this.config = properties.config
    this.eol = properties.config.eol
    this.formatter = properties.config.formatter ?? Formatters.defaultFormatter
    this.meta = properties.meta
  }

  debug(message?: any, ...args: any[]) {
    if (this.canPrint(LogLevel.DEBUG)) {
      this.print(LogLevel.DEBUG, new TextBuilder(message, args, this.config).toString())
    }
  }

  info(message?: any, ...args: any[]) {
    if (this.canPrint(LogLevel.INFO)) {
      this.print(LogLevel.INFO, new TextBuilder(message, args, this.config).toString())
    }
  }

  warn(message?: any, ...args: any[]) {
    if (this.canPrint(LogLevel.WARN)) {
      this.print(LogLevel.WARN, new TextBuilder(message, args, this.config).toString())
    }
  }

  error(message?: any, ...args: any[]) {
    if (this.canPrint(LogLevel.ERROR)) {
      this.print(LogLevel.ERROR, new TextBuilder(message, args, this.config).toString())
    }
  }

  fatal(message?: any, ...args: any[]) {
    if (this.canPrint(LogLevel.FATAL)) {
      this.print(LogLevel.FATAL, new TextBuilder(message, args, this.config).toString())
    }
  }

  private canPrint(level: LogLevel): boolean {
    if (!this.config.enabled)
      return false
    return this.config.exclusive
      ? !!(level & this.config.level)
      : level >= this.config.level
  }

  private print(level: LogLevel, text: string) {
    const entry = Formatters.createLogEntry(level, text, this.meta)
    for (const writer of this.config.writers) {
      if (writer.formatterProvider) {
        writer.write(writer.formatterProvider(entry) + this.eol)
      } else {
        writer.write(this.formatter(entry) + this.eol)
      }
    }
  }
}

const defaultLogger = new LoggerDefault()
export { defaultLogger as Log }
