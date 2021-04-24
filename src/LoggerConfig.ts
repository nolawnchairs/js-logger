import { FormatProvider } from './LoggerFormat'
import { LogWriter } from './LoggerOutput'

export interface LoggerConfigInstance {
  enabled: boolean
  level: number
  writers: LogWriter[]
  exclusive?: boolean
  serializationStrategy?: ObjectSerializationStrategy
  inspectionDepth?: number
  eol?: string
  formatter?: FormatProvider
}

export enum ObjectSerializationStrategy {
  OMIT,
  JSON,
  INSPECT,
}

export type LoggerConfigProvider = (value: string) => LoggerConfigInstance

export interface LoggerGlobalConfig {
  eol?: string
  formatter?: FormatProvider
  inspectionDepth?: number
}

export interface LoggerConfig extends LoggerGlobalConfig {
  loggers: Record<string, LoggerConfigInstance>
  defaults?: {
    named?: LoggerConfigProvider,
    module?: LoggerConfigProvider
  }
}
