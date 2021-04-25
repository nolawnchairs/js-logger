
import { FormatProvider } from './Format'
import { LogLevel } from './LogLevel'
import { LogWriter } from './Writer'

export type LoggerConfigProvider = (value: string) => LoggerConfigInstance

export interface LoggerGlobalConfig {
  eol?: string
  formatter?: FormatProvider
  inspectionDepth?: number
  inspectionColor?: boolean
  serializationStrategy?: ObjectSerializationStrategy
}

export interface LoggerConfig {
  global?: LoggerGlobalConfig
  providers: {
    globalLoggers: Record<string, LoggerConfigProvider>
    featureLogger?: LoggerConfigProvider
  }
}

export interface LoggerConfigInstance extends LoggerGlobalConfig {
  enabled: boolean
  level: LogLevel | number
  writers: LogWriter[]
}

export enum ObjectSerializationStrategy {
  OMIT,
  JSON,
  INSPECT,
}
