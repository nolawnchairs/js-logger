# Simple Logger

[![npm version](https://badge.fury.io/js/%40nolawnchairs%2Flogger.svg)](https://badge.fury.io/js/%40nolawnchairs%2Flogger)

A simple, zero-dependency Javascript logger with limited customizable output format.

Version 2.x is not backwards-compatible with versions 1.x

### Install
```
npm i @nolawnchairs/logger
yarn add @nolawnchairs/logger
```

### Usage

```
import { Logger, LogLevel } from '@nolawnchairs/logger

const Log = new Logger(LogLevel.Debug)

Log.info('You can use variables like this: %d', 42)
Log.info('this is a test log for INFO level')
Log.error('this is an ERROR level logging')
```

### Format

The default format is as follows:

```
2020-05-27T19:45:58.468Z 19027 INFO  | This is the message!
```

Logging format can be customized by using the second constructor parameter. 

```
const Log = new Logger(LogLevel.Debug, e => {
  return `${e.level} - ${e.date.toIsoString()} ${e.pid} ${e.message}`
})
```

This example will print:
```
INFO  2020-05-27T19:45:58.468Z 19027 This is the message!
```

Notes:
* Level colors cannot be changed.
* Levels `INFO` and `WARN` are padded at the end to fill the same 5 character spaces of `DEBUG` and `ERROR`
* By default, the message is separated from the rest of the logging data by a pipe `|` character for easy string splitting

### License
Use and abuse it however you like
	 