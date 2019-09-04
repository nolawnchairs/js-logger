/// <reference types="node" />

declare class Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

declare type Level = 'debug' | 'info' | 'warn' | 'error'
declare function log(appName: string, level: Level, options?: Options): Logger;

declare interface Options {
  printLevel?: 'full' | 'initial'
}

export = log
