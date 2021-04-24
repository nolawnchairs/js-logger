
import { inspect } from 'util'
import { vsprintf } from 'sprintf-js'
import { LoggerConfig, LoggerConfigInstance, LoggerConfigProvider, LoggerGlobalConfig, ObjectSerializationStrategy } from './LoggerConfig'
import { FormatProvider, LoggerFormat } from './LoggerFormat'
import { LogLevel } from './LogLevel'

export namespace Logger {

  type DefaultId = 'module' | 'named'

  const globalConfig: LoggerGlobalConfig = {}
  const globalLoggers: Map<string, Log> = new Map()
  const providerTemplates: Map<DefaultId, LoggerConfigProvider> = new Map()

  export function init({ loggers, defaults, ...rest }: LoggerConfig) {
    for (const logger of Object.keys(loggers)) {
      const config = loggers[logger]
      const instance = new Log({
        config,
        eol: config.eol ?? rest.eol,
        formatter: config.formatter ?? rest.formatter,
        inspectionDepth: config.inspectionDepth ?? 3
      })
      globalLoggers.set(logger, instance)
    }
    if (defaults.named)
      providerTemplates.set('named', defaults.named)
    if (defaults.module)
      providerTemplates.set('module', defaults.module)

    globalConfig.eol = rest.eol
    globalConfig.formatter = rest.formatter
    globalConfig.inspectionDepth = rest.inspectionDepth
  }

  export function forFeature(name: string, config?: LoggerConfigInstance): Log {
    return create('named', name, config)
  }

  export function forModule(name: string, config?: LoggerConfigInstance): Log {
    return create('module', name, config)
  }

  function create(defaultId: DefaultId, meta: string, config?: LoggerConfigInstance): Log {
    let loggerConfig: LoggerConfigInstance
    if (!config) {
      const findConfig = providerTemplates.get(defaultId)
      if (!findConfig)
        throw new Error(`Named logger for '${meta}' could not be initialized. No default configuration found`)
      loggerConfig = findConfig(meta)
    }

    return new Log({
      config: loggerConfig,
      eol: loggerConfig.eol ?? globalConfig.eol,
      formatter: loggerConfig.formatter ?? globalConfig.formatter,
      meta,
    })
  }

  export function debug(message: any, ...args: any[]) {
    globalLoggers.forEach(log => log.debug(message, args))
  }

  export function info(message: any, ...args: any[]) {
    globalLoggers.forEach(log => log.info(message, args))
  }

  export function warning(message: any, ...args: any[]) {
    globalLoggers.forEach(log => log.warn(message, args))
  }

  export function error(message: any, ...args: any[]) {
    globalLoggers.forEach(log => log.error(message, args))
  }

  export function fatal(message: any, ...args: any[]) {
    globalLoggers.forEach(log => log.fatal(message, args))
  }
}

type LoggerProperties = LoggerGlobalConfig & {
  config: LoggerConfigInstance
  meta?: string
}

const serialziers: Record<ObjectSerializationStrategy, (value: any, props: LoggerConfigInstance) => string> = {
  [ObjectSerializationStrategy.OMIT]: () => '',
  [ObjectSerializationStrategy.INSPECT]: (value, props) => inspect(value, true, props.inspectionDepth, false),
  [ObjectSerializationStrategy.JSON]: value => JSON.stringify(value)
}

class TextBuilder {
  constructor(
    readonly message: any,
    readonly args: any[],
    readonly config: LoggerConfigInstance) { }

  toString(): string {
    return vsprintf(this.message, this.args.map(a => {
      return typeof a == 'object'
        ? serialziers[this.config.serializationStrategy](a, this.config)
        : a
    }))
  }
}

class Log {

  private config: LoggerConfigInstance
  private eol: string
  private formatter: FormatProvider
  private meta?: string

  constructor(properties: LoggerProperties) {
    this.config = properties.config
    this.eol = properties.eol ?? '\n'
    this.formatter = properties.formatter ?? LoggerFormat.defaultFormatter
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
    const out = this.formatter(LoggerFormat.createLogEntry(level, text, this.meta))
    this.config.writers.forEach(w => w.write(out + this.eol))
  }
}
