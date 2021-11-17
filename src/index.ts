import { Log } from './Log'
import { LoggerConfig, LoggerInstanceConfig, LoggerGlobalConfig, LoggerInstanceConfigProvider, ObjectSerializationStrategy } from './Config'
import { Formatters, FormatProvider, LogEntry, AnsiColors } from './Format'
import { LogLevel } from './LogLevel'
import { LogWriter } from './Writer'

const LEVELS_ALL = 31

export {
  Log,
  LogWriter,
  LogLevel,
  LogEntry,
  Formatters,
  FormatProvider,
  AnsiColors,
  LoggerConfig,
  LoggerInstanceConfig,
  LoggerGlobalConfig,
  LoggerInstanceConfigProvider,
  ObjectSerializationStrategy,
  LEVELS_ALL,
}
