
import { inspect } from 'util'
import { vsprintf } from 'sprintf-js'
import { ObjectSerializationStrategy, LoggerConfigInstance } from './Config'
import { LogLevel } from './LogLevel'

export interface LogEntry {
  date: Date
  pid: string
  levelValue: string
  level: LogLevel
  message: string
  meta?: string
}

export enum AnsiColors {
  RESET = '\u001b[0m',
  BLACK = '\u001b[30m',
  GRAY = '\u001b[30;1m',
  WHITE = '\u001b[37m',
  RED = '\u001b[31m',
  GREEN = '\u001b[32m',
  YELLOW = '\u001b[33m',
  BLUE = '\u001b[34m',
  MAGENTA = '\u001b[35m',
  CYAN = '\u001b[36m',
  BRIGHT_RED = '\u001b[31;1m',
  BRIGHT_GREEN = '\u001b[32;1m',
  BRIGHT_YELLOW = '\u001b[33;1m',
  BRIGHT_BLUE = '\u001b[34;1m',
  BRIGHT_MAGENTA = '\u001b[35;1m',
  BRIGHT_CYAN = '\u001b[36;1m',
  BRIGHT_WHITE = '\u001b[37;1m',
  BRIGHT_BLACK = '\u001b[30;1m',
  BG_BRIGHT_RED = '\u001b[41;1m',
}

// Level meta information
type LevelMeta = Record<LogLevel, [string, AnsiColors]>
const levels: LevelMeta = {
  [LogLevel.DEBUG]: ['DEBUG', AnsiColors.BRIGHT_GREEN],
  [LogLevel.INFO]: [' INFO', AnsiColors.BRIGHT_BLUE],
  [LogLevel.WARN]: [' WARN', AnsiColors.BRIGHT_YELLOW],
  [LogLevel.ERROR]: ['ERROR', AnsiColors.BRIGHT_RED],
  [LogLevel.FATAL]: ['FATAL', AnsiColors.BG_BRIGHT_RED],
}

const serialziers: Record<ObjectSerializationStrategy, (value: any, props: LoggerConfigInstance) => string> = {
  [ObjectSerializationStrategy.OMIT]: () => '',
  [ObjectSerializationStrategy.INSPECT]: (value, props) => inspect(value, false, props.inspectionDepth, props.inspectionColor),
  [ObjectSerializationStrategy.JSON]: value => JSON.stringify(value)
}

// Formatter supplier function definition
export type FormatProvider = (e: LogEntry) => string

export class TextBuilder {
  private message: string
  private args: any[] = []
  constructor(message: any, args: any[], readonly config: LoggerConfigInstance) {
    this.args = args
    if (typeof message === 'string') {
      this.message = message
    } else {
      this.message = '%s'
      this.args = [message, ...args]
    }
  }

  toString(): string {
    return vsprintf(this.message, this.args.map(a => {
      const serialize = serialziers[this.config.serializationStrategy]
      return typeof a === 'object' && serialize
        ? serialize(a, this.config)
        : a
    }))
  }
}

export namespace Formatters {

  const pid = process.pid

  export function createLogEntry(level: LogLevel, message: string, meta?: string): LogEntry {
    return {
      date: new Date(),
      level,
      levelValue: levels[level][0],
      message,
      pid: pid.toString(10),
      meta,
    }
  }

  export function colorize(color: AnsiColors, text: string): string {
    return color + text + AnsiColors.RESET
  }

  export function defaultFormatter(e: LogEntry): string {
    const [levelValue, levelColorizer] = levels[e.level]
    return [
      colorize(AnsiColors.GRAY, e.date.toISOString()),
      e.pid,
      colorize(levelColorizer, levelValue),
      e.meta
        ? colorize(AnsiColors.GRAY, '| ') + colorize(AnsiColors.CYAN, e.meta) + ' ' + colorize(AnsiColors.GRAY, '|')
        : colorize(AnsiColors.GRAY, '|'),
      e.message].filter(s => !!s).join(' ')
  }

  export function monochromeFormatter(e: LogEntry): string {
    const [levelValue] = levels[e.level]
    return [
      e.date.toISOString(),
      e.pid,
      levelValue,
      e.meta ? ' | ' + e.meta + ' |' : '|',
      e.message].filter(s => !!s).join(' ')
  }
}