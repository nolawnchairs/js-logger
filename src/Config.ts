
import { FormatProvider } from './Format'
import { LogLevel } from './LogLevel'
import { LogWriter } from './Writer'

export type LoggerInstanceConfigProvider = (value: string) => LoggerInstanceConfig

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
    globalLoggers: Record<string, LoggerInstanceConfigProvider>
    featureLogger?: LoggerInstanceConfigProvider
  }
}

export interface LoggerInstanceConfig extends LoggerGlobalConfig {
  enabled: boolean
  level: LogLevel | number
  writers: LogWriter[]
}

export enum ObjectSerializationStrategy {
  OMIT,
  JSON,
  INSPECT,
}
