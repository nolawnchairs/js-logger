
import { LogWriter } from '.'
import { LoggerConfig, LoggerInstanceConfig, LoggerInstanceConfigProvider, LoggerGlobalConfig, ObjectSerializationStrategy } from './Config'
import { Formatters, TextBuilder, TextBuilderConfig } from './Format'
import { LogLevel } from './LogLevel'
import { mergeOptions } from './Util'

interface Logger {
  /**
   * Prints a DEBUG level log
   *
   * @param {*} message the message
   * @param {...any[]} args the arguments to append to the message, or to inject into the message if using sprintf syntax
   * @memberof Logger
   */
  debug(message: any, ...args: any[]): void
  /**
   * Prints an INFO level log
   *
   * @param {*} message the message
   * @param {...any[]} args the arguments to append to the message, or to inject into the message if using sprintf syntax
   * @memberof Logger
   */
  info(message: any, ...args: any[]): void
  /**
   * Prints a WARN level log
   *
   * @param {*} message the message
   * @param {...any[]} args the arguments to append to the message, or to inject into the message if using sprintf syntax
   * @memberof Logger
   */
  warn(message: any, ...args: any[]): void
  /**
   * Prints an ERROR level log
   *
   * @param {*} message the message
   * @param {...any[]} args the arguments to append to the message, or to inject into the message if using sprintf syntax
   * @memberof Logger
   */
  error(message: any, ...args: any[]): void
  /**
   * Prints a FATAL level log
   *
   * @param {*} message the message
   * @param {...any[]} args the arguments to append to the message, or to inject into the message if using sprintf syntax
   * @memberof Logger
   */
  fatal(message: any, ...args: any[]): void
}

const globalLoggers: Map<string, LogImpl> = new Map()
const defaultConfig: LoggerGlobalConfig = {
  serializationStrategy: ObjectSerializationStrategy.INSPECT,
  inspectionColor: false,
  inspectionDepth: 3,
  eol: '\n',
  formatter: Formatters.defaultFormatter,
}

class DefaultLogger implements Logger {

  private globalConfig: LoggerGlobalConfig = {}
  private featureLoggerTemplate: LoggerInstanceConfigProvider

  /**
   * Initializes the logging service
   *
   * @param {LoggerConfig} config the configuration for the logging service
   * @memberof DefaultLogger
   */
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
          ...rest,
        },
      })
      globalLoggers.set(logger, instance)
    }

    if (providers.featureLogger) {
      this.featureLoggerTemplate = providers.featureLogger
    }
  }

  /**
   * Initializes a logging instance for a specific feature of your applcation
   *
   * @param {string} context the context for this logger, such as a class name or module name
   * @param {LoggerInstanceConfig} [config] the optional configuration for this instance. If not provided, will inherit the default logger config defined in the init method under the featureLoggers property
   * @return {*}  {Logger}
   * @memberof DefaultLogger
   */
  forFeature(context: string, config?: LoggerInstanceConfig): Logger {
    let loggerConfig: LoggerInstanceConfig
    if (!config) {
      if (!this.featureLoggerTemplate)
        throw new Error(`Named logger for '${context}' could not be initialized. No default configuration found`)
      loggerConfig = this.featureLoggerTemplate(context)
    }

    const { eol, inspectionColor, inspectionDepth, formatter, ...rest } = loggerConfig
    return new LogImpl({
      context,
      config: {
        ...mergeOptions(this.globalConfig, { eol, inspectionColor, inspectionDepth, formatter }),
        ...rest,
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
  config: LoggerInstanceConfig
  context?: string,
}

class LogImpl implements Logger {

  private readonly enabled: boolean
  private readonly context?: string
  private readonly level: number
  private readonly writers: LogWriter[]
  private readonly textConfig: TextBuilderConfig
  private readonly serializationStrategy: ObjectSerializationStrategy
  private readonly eol: string

  constructor(properties: LoggerProperties) {
    const { config, context } = properties
    const { enabled, eol, inspectionColor, inspectionDepth,
      formatter, level, writers, serializationStrategy } = config

    this.enabled = enabled
    this.serializationStrategy = serializationStrategy
    this.textConfig = {
      color: inspectionColor,
      depth: inspectionDepth,
    }
    this.eol = eol
    this.context = context
    this.writers = writers

    // Assign provided formatter or default formatter to all writers that did not define one
    this.writers.filter(w => !w.formatter)
      .forEach(w => w.setFormatter(formatter ?? Formatters.defaultFormatter))

    if ((Math.log(level) / Math.log(2)) % 1) { // Masked level
      this.level = level
    } else { // single level, so assign all higher levels
      this.level = Object.values(LogLevel)
        .filter(l => l >= level)
        .reduce((a, c) => a |= Number(c), 0)
    }
  }

  debug(message?: any, ...args: any[]) {
    if (this.canPrint(LogLevel.DEBUG)) {
      this.print(LogLevel.DEBUG, new TextBuilder(
        message,
        args,
        this.serializationStrategy,
        this.textConfig,
      ).toString())
    }
  }

  info(message?: any, ...args: any[]) {
    if (this.canPrint(LogLevel.INFO)) {
      this.print(LogLevel.INFO, new TextBuilder(
        message,
        args,
        this.serializationStrategy,
        this.textConfig,
      ).toString())
    }
  }

  warn(message?: any, ...args: any[]) {
    if (this.canPrint(LogLevel.WARN)) {
      this.print(LogLevel.WARN, new TextBuilder(
        message,
        args,
        this.serializationStrategy,
        this.textConfig,
      ).toString())
    }
  }

  error(message?: any, ...args: any[]) {
    if (this.canPrint(LogLevel.ERROR)) {
      this.print(LogLevel.ERROR, new TextBuilder(
        message,
        args,
        this.serializationStrategy,
        this.textConfig,
      ).toString())
    }
  }

  fatal(message?: any, ...args: any[]) {
    if (this.canPrint(LogLevel.FATAL)) {
      this.print(LogLevel.FATAL, new TextBuilder(
        message,
        args,
        this.serializationStrategy,
        this.textConfig,
      ).toString())
    }
  }

  private canPrint(level: LogLevel): boolean {
    return this.enabled && !!(level & this.level)
  }

  private print(level: LogLevel, text: string) {
    const entry = Formatters.createLogEntry(level, text, this.context)
    for (const writer of this.writers) {
      writer.write(writer.formatter(entry) + this.eol)
    }
  }
}

const defaultLogger = new DefaultLogger()
export { defaultLogger as Log }
