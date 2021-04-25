//module.exports = { Logger, LogLevel, LogEntry } = require('./lib/Logger')

module.exports = {
  Log,
  LogWriter,
  LogLevel,
  LogEntry,
  Formatters,
  FormatProvider,
  AnsiColors,
  LoggerConfig,
  LoggerConfigInstance,
  LoggerGlobalConfig,
  LoggerConfigProvider,
  ObjectSerializationStrategy,
} = require('./lib/index')