
import { FormatProvider } from './Format'
import { LogLevel } from './LogLevel'
import { LogWriter } from './Writer'

export type LoggerInstanceConfigProvider = (value: string) => LoggerInstanceConfig

export interface LoggerGlobalConfig {
  /**
   * The end-of-line character. Defalts to \n
   *
   * @type {string}
   * @memberof LoggerGlobalConfig
   */
  eol?: string
  /**
   * The formatter provider. This will be the formatter that serves
   * as the default for any writers that do not define their own
   *
   * @type {FormatProvider}
   * @memberof LoggerGlobalConfig
   */
  formatter?: FormatProvider
  /**
   * Defines the depth of object inspection (how many nested objects get printed)
   * when printing objects to the console or file. If an object has nested objects or
   * arrays that are nested deeper than this setting, they will print as '[object Object]'
   * and 'element1,element2', respectivey. Defaults to 3
   *
   * @type {number}
   * @memberof LoggerGlobalConfig
   */
  inspectionDepth?: number
  /**
   * Whether or not to add ANSI color to the inspected nested objects and arrays.
   * This should only be set for console loggers and not file loggers. Defaults to false
   *
   * @type {boolean}
   * @memberof LoggerGlobalConfig
   */
  inspectionColor?: boolean
  /**
   * Defines the strategy by which arrays and objects are serialized to the output
   * Defalts to ObjectSerializationStrategy.INSPECT
   *
   * @type {ObjectSerializationStrategy}
   * @memberof LoggerGlobalConfig
   */
  serializationStrategy?: ObjectSerializationStrategy
}

export interface LoggerConfig {
  global?: LoggerGlobalConfig
  providers: {
    globalLoggers: Record<string, LoggerInstanceConfigProvider>
    featureLogger?: LoggerInstanceConfigProvider,
  }
}

export interface LoggerInstanceConfig extends LoggerGlobalConfig {
  /**
   * Whether or not this logger is enabled
   *
   * @type {boolean}
   * @memberof LoggerInstanceConfig
   */
  enabled: boolean
  /**
   * The logging level to use. Supply a single Loglevel value and the logger
   * will print all logs from the supplied level, UP. LogLevels are ordered by
   * the severity: DEBUG, INFO, WARN, ERROR and FATAL. Choosing WARN will enable
   * WARN, ERROR and FATAL.
   *
   * You can also OR multiple levels together to form a bitmask and the logger will
   * print only those levels. LogLevel.INFO | LogLevel.ERROR will only print logs
   * for onlt those two levels
   *
   * To print ALL levels, use the provided constant LEVELS_ALL
   *
   * @type {(LogLevel | number)}
   * @memberof LoggerInstanceConfig
   */
  level: LogLevel | number
  /**
   * An array of LogWriter instances to use with this logger
   *
   * @type {LogWriter[]}
   * @memberof LoggerInstanceConfig
   */
  writers: LogWriter[]
}

export enum ObjectSerializationStrategy {
  /**
   * Omits the value from the message all together
   */
  OMIT,
  /**
   * Serializes the value to JSON
   */
  JSON,
  /**
   * Outputs an inspection of the value with a default
   * depth of 3. This option outputs the same as the console.log
   * and console.error functions in Node. Useful for console
   * output, less so for files where JSON should be preferred
   */
  INSPECT,
}
