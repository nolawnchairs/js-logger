// Generated by dts-bundle-generator v5.3.0

/// <reference types="node" />

import { WriteStream } from 'fs';

export declare enum LogLevel {
  DEBUG = 1,
  INFO = 2,
  WARN = 4,
  ERROR = 8,
  FATAL = 16
}
export interface LogEntry {
  date: Date;
  pid: string;
  levelValue: string;
  level: LogLevel;
  message: string;
  meta?: string;
}
declare enum AnsiColors {
  RESET = "\u001B[0m",
  BLACK = "\u001B[30m",
  GRAY = "\u001B[30;1m",
  WHITE = "\u001B[37m",
  RED = "\u001B[31m",
  GREEN = "\u001B[32m",
  YELLOW = "\u001B[33m",
  BLUE = "\u001B[34m",
  MAGENTA = "\u001B[35m",
  CYAN = "\u001B[36m",
  BRIGHT_RED = "\u001B[31;1m",
  BRIGHT_GREEN = "\u001B[32;1m",
  BRIGHT_YELLOW = "\u001B[33;1m",
  BRIGHT_BLUE = "\u001B[34;1m",
  BRIGHT_MAGENTA = "\u001B[35;1m",
  BRIGHT_CYAN = "\u001B[36;1m",
  BRIGHT_WHITE = "\u001B[37;1m",
  BRIGHT_BLACK = "\u001B[30;1m",
  BG_BRIGHT_RED = "\u001B[41;1m"
}
export declare type FormatProvider = (e: LogEntry) => string;
export declare namespace Formatters {
  function createLogEntry(level: LogLevel, message: string, meta?: string): LogEntry;
  function colorize(color: AnsiColors, text: string): string;
  function defaultFormatter(e: LogEntry): string;
  function monochromeFormatter(e: LogEntry): string;
}
export declare type WriterInterface = WriteStream | NodeJS.WriteStream;
export declare type Provider = () => Promise<WriterInterface>;
export interface WriterOptions {
  formatProvider?: FormatProvider
}
export declare type FileWriterOptions = WriterOptions & {
  mode?: number
  encoding?: BufferEncoding
}
export declare class LogWriter {
  constructor(writerProvider: Provider, options?: WriterOptions | FileWriterOptions);
  static stdout(options?: WriterOptions): LogWriter;
  static stderr(options?: WriterOptions): LogWriter;
  static file(filePath: string, options?: FileWriterOptions): LogWriter;
  get formatterProvider(): FormatProvider;
  write(value: string): Promise<void>;
}
export interface LoggerConfigInstance extends LoggerGlobalConfig {
  enabled: boolean;
  level: LogLevel | number;
  writers: LogWriter[];
}
export declare enum ObjectSerializationStrategy {
  OMIT = 0,
  JSON = 1,
  INSPECT = 2
}
export declare type LoggerConfigProvider = (value: string) => LoggerConfigInstance;
export interface LoggerGlobalConfig {
  eol?: string;
  formatter?: FormatProvider;
  inspectionDepth?: number;
  inspectionColor?: boolean
  serializationStrategy?: ObjectSerializationStrategy;
}
export interface LoggerConfig {
  global?: LoggerGlobalConfig;
  providers: {
    globalLoggers: Record<string, LoggerConfigProvider>;
    featureLogger?: LoggerConfigProvider;
  };
}
export interface Logger {
  debug(message: any, ...args: any[]): void;
  info(message: any, ...args: any[]): void;
  warn(message: any, ...args: any[]): void;
  error(message: any, ...args: any[]): void;
  fatal(message: any, ...args: any[]): void;
}
declare class LoggerDefault implements Logger {
  init(config: LoggerConfig): void;
  forFeature(name: string, config?: LoggerConfigInstance): Logger;
  debug(message: any, ...args: any[]): void;
  info(message: any, ...args: any[]): void;
  warn(message: any, ...args: any[]): void;
  error(message: any, ...args: any[]): void;
  fatal(message: any, ...args: any[]): void;
}
export declare type LoggerProperties = LoggerGlobalConfig & {
  config: LoggerConfigInstance;
  meta?: string;
};
declare const defaultLogger: LoggerDefault;

export { defaultLogger as Log };
