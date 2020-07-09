# Simple Logger

[![npm version](https://badge.fury.io/js/%40nolawnchairs%2Flogger.svg)](https://badge.fury.io/js/%40nolawnchairs%2Flogger)

A simple, zero-dependency NodeJS logger with customizable colors and output format to use across your entire Node app. Fun!

Version 2.x is not backwards-compatible with versions 1.x

### Install
```
npm i @nolawnchairs/logger
yarn add @nolawnchairs/logger
```

### Usage

```
import { Logger, LogLevel } from '@nolawnchairs/logger

const logger = new Logger(LogLevel.Debug)

logger.info('this is an info message')
logger.error('this is an ERROR level logging')
```

Since under the hood, this is simply an abstraction over `console.log` and `console.error`, you can add string formatting to the first argument
```
logger.info('You can use variables like this: %d', 42)
...

2020-05-27T19:45:58.468Z 19027 INFO  | You can use variables like this: 42
```

### Format

The default format is as follows:

```
logger.info('This is the message!')
...

2020-05-27T19:45:58.468Z 19027 INFO  | This is the message!
```

Logging format can be customized by using the second constructor parameter, which is a function that provides two arguments: `entry` and `colorizer`


```
const logger = new Logger(LogLevel.Debug, (entry, colorizer) => {
  return `[${e.levelValue.trim()}] - ${e.date.toIsoString()} ${e.pid} ${e.message}`
})

logger.info('This is the message!')
...

[INFO] 2020-05-27T19:45:58.468Z 19027 This is the message!
```

### LogEntry
The log entry contains the following values:

| `Key` | `Type` | `Description` |
|-|-|-|
| `date`| Date | Javascript Date object |
| `level` | LogLevel | `LogLevel` enum value |
| `levelValue` | string | string representation of level. The INFO and WARN strings are end-padded with a space for symmetry with ERROR and DEBUG |
| `pid` | string | string value of process ID |
| `message` | string | the formatted message |


### Colorizer
The colorizer object contains static functions to colorize output using ANSI colors

| `Function` | `Description` |
|-|-|
| `green` | Colors the text green, default for `DEBUG ` |
| `cyan` | Colors the text light blue (cyan), default for `INFO` |
| `yellow` | Colors the text yellow, default for `WARN` |
| `red` | Colors the text red, default for `ERROR` |
| `grey` | Colors the text grey, default for the date |
| `custom` | Customizes the color. The first argument is the text to be colored, the second is the ANSI code's value which is between the `[` and the `m`. For `\x1b[41m`, pass `41`, for `\x1b[30;1m`, pass `30;1` |
| `levelDefault` | Colors the text the default color of the `LogLevel` provided in the first argument. The second (optional argument) is the text to print. This can be any text, but if left undefined, it will print the default level text value (e.g. `INFO `) with the default end padding

An example using the custom formatter that prints the first character of the level only, followed by the date, pid a pipe, then the message:

```
const customLogger = new Logger(LogLevel.Debug, (entry, colorizer) => {
  return [
    `[${colorizer.levelDefault(entry.level, entry.levelValue.charAt(0))}]`,
    colorizer.grey(entry.date.toISOString()),
    entry.pid,
    '|',
    entry.message
  ].join(' ')
})

customLogger.info('This is a test message')
...

[I] 2020-07-09T20:57:24.670Z 26816 | This is a test message
```

## Expanding

**`Log.expand()`**

Some objects you want to log are complex data structures with nested arrays and objects. By default, the first argument to any log call is not inspected, but subsequent args added will all be inspected to a reasonable depth. To allow the capability of printing out these objects fully, you can expand the logger.

```
const sample = {
  name: 'Rick Sanchez',
  intelligence: 10,
  sidekick: {
    name: 'Morty Smith',
    intelligence: 2,
  }
}

Log.info(sample)
...

[object Object]

Log.expand().info(sample)
...
{ name: 'Rick Sanchez',
 intelligence: 10,
 sidekick: { name: 'Morty Smith', intelligence: 2 } }
```

All varargs are already expanded by default. This has a limited depth of `2`, so you can expand to the desired depth. Circular references are always represented as `[Circular]`.

```
Log.info('Sample', sample)
...

Sample { name: 'Rick Sanchez',
  intelligence: 10,
  sidekick: { name: 'Morty Smith', intelligence: 2 } }
```
## Forcing Level

There may be times where you wish to print an `INFO` level message when your level is set to a higher level such as `WARN` or `ERROR`. This is just sugar for creating a new logger instance with level `DEBUG`

```
logger.force().info('This is an info message that is guaranteed to print')
```

### License
Use and abuse it however you like
	 