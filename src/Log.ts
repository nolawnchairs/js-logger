
import { AnsiColors, LEVELS_ALL, LogWriter } from '.'
import { LoggerConfig, LoggerInstanceConfig, LoggerInstanceConfigProvider, LoggerGlobalConfig, ObjectSerializationStrategy } from './Config'
import { Formatters, TextBuilder, TextBuilderConfig } from './Format'
import { LogLevel } from './LogLevel'
import { computeLevel, mergeOptions } from './Util'

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
  /**
   * Prints an assertion to the log
   *
   * @param {boolean} condition
   * @param {*} message
   * @param {...any[]} args
   * @memberof Logger
   */
  assert(condition: boolean, message: any, ...args: any[]): void
}

const globalLoggers: Map<string, LogImpl> = new Map()
const defaultConfig: LoggerGlobalConfig = {
  eol: '\n',
  inspectionColor: false,
  inspectionDepth: 3,
  serializationStrategy: ObjectSerializationStrategy.INSPECT,
  formatter: Formatters.defaultFormatter,
  assertionsEnabled: true,
  assertionLevel: LogLevel.DEBUG,
}

export class DefaultLogger implements Logger {

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
   * Initializes a logging instance for a specific feature of your application
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

  assert(condition: boolean, message: any, ...args: any[]) {
    globalLoggers.forEach(log => log.assert(condition, message, ...args))
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
  private readonly assertionsEnabled: boolean
  private readonly assertionsLevel: LogLevel

  constructor(properties: LoggerProperties) {
    const { config, context } = properties
    const { enabled, eol, inspectionColor, inspectionDepth, assertionLevel, assertionsEnabled,
      formatter, level = LEVELS_ALL, writers, serializationStrategy } = config

    this.enabled = enabled ?? true
    this.assertionsLevel = assertionLevel
    this.assertionsEnabled = assertionsEnabled
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
    this.level = computeLevel(level)
  }

  debug(message?: any, ...args: any[]) {
    this.print(LogLevel.DEBUG, () => new TextBuilder(
      message,
      args,
      this.serializationStrategy,
      this.textConfig,
    ).toString())
  }

  info(message?: any, ...args: any[]) {
    this.print(LogLevel.INFO, () => new TextBuilder(
      message,
      args,
      this.serializationStrategy,
      this.textConfig,
    ).toString())
  }

  warn(message?: any, ...args: any[]) {
    this.print(LogLevel.WARN, () => new TextBuilder(
      message,
      args,
      this.serializationStrategy,
      this.textConfig,
    ).toString())
  }

  error(message?: any, ...args: any[]) {
    this.print(LogLevel.ERROR, () => new TextBuilder(
      message,
      args,
      this.serializationStrategy,
      this.textConfig,
    ).toString())
  }

  fatal(message?: any, ...args: any[]) {
    this.print(LogLevel.FATAL, () => new TextBuilder(
      message,
      args,
      this.serializationStrategy,
      this.textConfig,
    ).toString())
  }

  assert(condition: boolean, message: any, ...args: any[]) {
    if (!condition && this.assertionsEnabled && this.isLevelEnabled(this.assertionsLevel)) {
      this.print(
        this.assertionsLevel,
        () => new TextBuilder(
          Formatters.colorize(AnsiColors.BRIGHT_RED, 'Assertion Failed') + ': ' + message,
          args,
          this.serializationStrategy,
          this.textConfig,
        ).toString(),
      )
    }
  }

  private isLevelEnabled(level: LogLevel): boolean {
    return this.enabled && !!(level & this.level)
  }

  private print(level: LogLevel, messageProvider: () => string) {
    const entry = Formatters.createLogEntry(level, messageProvider(), this.context)
    for (const writer of this.writers) {
      if (writer.isLevelEnabled(level) && this.isLevelEnabled(level))
        writer.write(writer.formatter(entry) + this.eol)
    }
  }
}
