import { Log } from './Log'
import { LoggerConfig, LoggerConfigInstance, LoggerGlobalConfig, LoggerConfigProvider, ObjectSerializationStrategy } from './Config'
import { Formatters, FormatProvider, LogEntry, AnsiColors } from './Format'
import { LogLevel, LogLevelEmoji } from './LogLevel'
import { LogWriter } from './Writer'

const LEVELS_ALL = 31

export {
  Log,
  LogWriter,
  LogLevel,
  LogLevelEmoji,
  LogEntry,
  Formatters,
  FormatProvider,
  AnsiColors,
  LoggerConfig,
  LoggerConfigInstance,
  LoggerGlobalConfig,
  LoggerConfigProvider,
  ObjectSerializationStrategy,
  LEVELS_ALL,
}
