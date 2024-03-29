# Logger

[![npm version](https://badge.fury.io/js/%40nolawnchairs%2Flogger.svg)](https://badge.fury.io/js/%40nolawnchairs%2Flogger)

Version 3.x is incompatible with 2.x and 1.x. Note that this project is more or less an "in-house" tool, so no guarantees.

For v2 docs, go [here](V2.md)

## Install
```
npm i @nolawnchairs/logger
yarn add @nolawnchairs/logger
```

## Setting Logging Up

As opposed to v2, there is more boilerplate to configure, since we now provide multiple logging environments that can each write to multiple output streams.

Set up your logging environments using the `init` method. The `providers.globalLoggers` object must contain at least one object that defines the function providing the configuration for this logger:

```javascript
Log.init({
  providers: {
    globalLoggers: {
      development: () => ({
        enabled: process.env.NODE_ENV === 'development',
        level: LogLevel.DEBUG,
        serializationStrategy: ObjectSerializationStrategy.INSPECT,
        writers: [
          LogWriter.stdout(),
          LogWriter.file(`${LOG_DIR}/my-application.log`, { 
            formatter: Formatters.jsonFormatter 
          })
        ]
      })
    }
  }
})
```

In the above example, we define a single `globalLogger`. The name we give this logger is `development`, and it returns a `LoggerInstanceConfig` object. Here, the `enabled` key is set based on whether or not we're in development mode, we set the `level` to `DEBUG`, set a serialization strategy (which dictates how non-scalar values are treated when printing), and an array of `LogWriter` instances that define where the logging output goes.



## Global vs Feature Loggers

Global loggers are available throughout your project and are logged to using the standard `Log` interface as such:

```javascript
Log.info('This is a test message')
```

Feature Loggers are only available within the class or module in which they are defined, and accept a `string` value that will identify where the message came from. This is useful in larger projects, since the message will give you context as to where it was printed. 

Crate a Feature Logger:

```javascript
const logger = Log.forFeature('FeatureClass')
logger.info('Test info message from the FeatureClass')
```

Feature Loggers require configuration just like Global Loggers do. You can pass configuration to each one you create:

```javascript
const logger = Log.forFeature('FeatureClass', {
  enabled: true,
  level: LogLevel.ERROR,
  writers: [
    LogWriter.stdout(),
    LogWriter.file(`${LOG_DIR}/logs/feature-class.log`, { 
      formatter: Formatters.monochromeFormatter 
    }),
  ]
})

logger.info('Test info message from the FeatureClass')
```
Or you can create a default configuration for all Feature Loggers that don't provide configuration themselves, which is easier, and will format all Feature Loggers the same:

```javascript
const IS_DEV = process.env.NODE_ENV === 'development'

Log.init({
  providers: {
    globalLoggers: {...},
    featureLogger: context => {
      const logName = snakeCase(context)
      return {
        enabled: true,
        level: IS_DEV ? LogLevel.DEBUG : LogLevel.ERROR,
        serializationStrategy: ObjectSerializationStrategy.INSPECT,
        writers: [
          LogWriter.stdout(),
          // Create a new log file for each feature
          LogWriter.file(`${LOG_DIR}/logs/feature.${logName}.log`, { 
            formatter: Formatters.jsonFormatter 
          })
          // Or use the same file for all logging.
          LogWriter.file(`${LOG_DIR}/my-application.log`, { 
            formatter: Formatters.jsonFormatter 
          })
        ]
      }
    } 
  }
})
```

You can of course add custom configuration to any Feature Logger you create, which will override the default configuration.

---
### `enum` LogLevel

The `LogLevel` enum contains the following values:

* `DEBUG`
* `INFO`
* `WARN`
* `ERROR`
* `FATAL`

Each logger instance contains identical methods for each:
`debug`, `info`, `warn`, `error` and `fatal`

Each log level method takes one or more arguments. The first argument will always be printed, any additional arguments will only be printed if the first argument is a string with sprintf-type tokens that will be printed in order. 

If the first argument is **not** a string, only the first argument will be printed, and the serialization strategy will apply. This example uses the default `INSPECT` strategy.

```javascript
Log.info('Test') // Test
Log.info('Test #%d', 1) // Test #1
Log.info('Test', '123') // Test
Log.info([1, 2, 3]) // [1, 2, 3]
Log.info({ value: 42 }) // { value: 42 }
Log.info('The thing with id "%s" was not found', 42) // The thing with id "42" was not found
Log.info('%d + %d = %d', 10, 10, 10 + 10) // 10 + 10 = 20
```

> More detailed documentation on sprintf tokens can be found [here](https://github.com/alexei/sprintf.js#readme)


### Assertions

Along with the standard log functions, there is also an `assert` method which you can call to print an "Assertion Failed" message if a given condition resolves to a false-like value.

```javascript
const [a, b] = [1, 0]
Log.assert(a === b, '%d should equal %d', a, b)
// Will print:
// Assertion Failed: 1 should equal 0
```

Assertions are bound to a certain logging level, `LogLevel.DEBUG` by default, but this can be changed with the `assertionLevel` property in the global configuration. You can completely disable assertions for all levels by setting `assertionsEnabled` to false in the global configuration.

---
### `enum` ObjectSerializationStrategy

This setting will govern how non-scalar (objects, classes and arrays) are printed. The `ObjectSerializationStrategy` enum contains the following values:

* `OMIT` - the value is ignored
* `JSON` - the value is serialized into JSON
* `INSPECT` - the value is expanded to a readable format. This is the method used my the default `console.log` implementation

---

## Configuration

Each logger we create requires its configuration to be set. We define these in the `init` method of the main `Log` interface, or individually for Feature Loggers should they require custom configuration than the default provided in `init`

Configuration is set in the `Log.init()` method, and has the following structure:

```
{
  global: LoggerGlobalConfig
  providers: {
    globalLoggers: {
      yourLoggerName: () => LoggerInstanceConfig
      anotherLogger: () => LoggerInstanceConfig
    }
    featureLogger: () => LoggerInstanceConfig
  }
}
```

### `interface` LoggerGlobalConfig

The following values can be set to the `global` object, and will provide default values to all your other loggers

| Property | Type | Description | Required |
| ----------- | ----------- | -------- | :--------: |
| `eol` | string | The end-of-line character. Defaults to `\n`  ||
| `serializationStrategy` | `ObjectSerializationStrategy` | How non-scalar values will be printed. Defaults to `INSPECT` ||
| `inspectionDepth` | number | The depth of serialization when using the `INSPECT` strategy. Defaults to `3` [See...](https://nodejs.org/api/util.html#util_util_inspect_object_options)  || 
| `inspectionColor` | boolean | Used in the `INSPECT` strategy, governs whether or not to color the inspected object ||
| `formatter` | `FormatProvider` | Defines a custom formatter for each `LogWriter` attached this logger. Note that writers may override this with their own formatter ||
| `assertionsEnabled` | boolean | Whether or not failed assertion messages will be printed, Defaults to `true`, but will depend on the logging level to which they are bound | |
| `assertionLevel` | `LogLevel` | The log level to which failed assertion messages will be printed. Defaults to `LogLevel.DEBUG`. Note that if choosing a log level that's is not enabled, assertions will not print ||
---

### `interface` LoggerInstanceConfig

Each individual logger you define must be configured with the following properties.


| Property | Type | Description | Required |
| ----------- | ----------- | -------- | :--------: |
| `enabled?` | boolean | Whether this logger will produce data. Defaults to `true` | ✅ |
| `level?` | `LogLevel \| number` | The level to which this logger will adhere. Use a `LogLevel` enum value or an `or`'ed bitmask of multiple levels to use in unison<sup>1</sup>. The value set here will apply the same constraints to child writers. If specifying custom levels for writers, leave this option empty, as it defaults to `LEVELS_ALL` | ✅ |
| `writers` | `LogWriter[]` | An array of `LogWriter` instances this logger will use | ✅ |


In addition to the above properties, the `LoggerInstanceConfig` will accept any of the properties defined in `LoggerGlobalConfig`, which will override any default values you set in `global`.


#### Notes
<sup>1</sup> Specifying a single level will print anything from the defined level, **UP**. Meaning that a `WARN` level will print `WARN`, `ERROR` and `FATAL`, but not `INFO` or `DEBUG`. You can, however, define log level in a non-contiguous manner by masking two levels together:

```javascript
{
  level: LogLevel.INFO | LogLevel.ERROR
}
```
The above configuration will ONLY print `INFO` or `ERROR` messages, and nothing else

---

## Formatters

Formatters define how the logging messages are structured in output. There are three formatters included by default:

### `Formatters.defaultFormatter`

`defaultFormatter` produces colored formatting, ideal for console streams:

```
// Global
2021-04-25T18:48:35.409Z 45532  INFO | Testing 123

// Feature
2021-04-25T18:48:35.409Z 45532  INFO | FeatureName | Testing 123
```

### `Formatters.monochromeFormatter`

`monochromeFormatter` produces the same output as the `defaultFormatter`, but without the coloring

### `Formatters.jsonFormatter`

`jsonFormatter` produces a JSON object for each line printed. Useful for file logging where extra processing or analysis may be required

```
# Global
{"date":"2021-04-26T14:21:55.392Z","pid":"1031654","level":"INFO","message":"Testing 123"}

# Feature
{"date":"2021-04-26T14:21:55.392Z","pid":"1031654","level":"INFO","context":"FeatureName","message":"Testing 123"}
```

### `Formatters.colorize(color: AnsiColors, text: string)`

`returns string`

This is a convenience function to colorize text. It takes an `AnsiColors` enum value and the text to apply the color to. The standard `AnsiColors.RESET` is applied at the end of the string

## Custom Formatters

You can create a custom formatter by defining a function that accepts a `LogEntry` object and returns a string. You can include the formatter inside the `LoggerInstanceConfig`.

### `type` FormatterProvider


`function (e: LogEntry) => string`

```javascript
{
  enabled: true,
  level: LogLevel.INFO,
  formatter: (e: LogEntry) => {
    return `${e.date.toIsoString()} - ${e.levelText} - ${e.message}`
  },
  writers: [...]
}
```

### `interface` LogEntry

The `LogEntry` object is passed to every formatter function and includes the following data required to print logs:


| Property | Type | Description |
|---|---|---|
|`date` | `Date` | The date object referencing the time the log event occurred |
|`pid`| string | The process ID of the running process, in string format |
|`level`|`LogLevel` | The `LogLevel` enum value of the log event |
|`levelText` | string | The text representation of the level, in CAPS. Note that `INFO` and `WARN` are left-padded with one empty space to accommodate symmetry |
|`levelColor` | `AnsiColors` | The `AnsiColors` enum value of the default color for the log event's level |
|`message` | string | The formatted log message |
|`context` | string | Only provided for Feature Loggers if set, the string value passed as the `context` argument |



## Log Writers

Each logger you create can include one or more `LogWriter`s that produce the logs to an output stream.



### `LogWriter.stdout(options?: WriterOptions)`

Prints to stdout

### `LogWriter.stderr(options?: WriterOptions)`

Prints to stderr

### `LogWriter.file(file: string, options?: FileWriterOptions)`
Prints to a file. The `file` argument is required and must be the path to the writable log file. If this file does not exist, it will be automatically created for you.

> File writers will attempt to re-use existing opened write streams, which are indexed by the resolved file path parameter. 

When defining Feature Loggers, either inline or in the global configuration, you can set the log file name within the definition. It is recommended that you use consistent absolute paths to avoid multiple write streams to the same files. All paths passed to the `LogWriter.file` function are normalized using the `path.resolve` function provided by NodeJS to ensure only a single stream to a given file exists.

```javascript
  featureLogger: name => ({
    enabled: !IS_DEV,
    level: LogLevel.ERROR,
    formatter: Formatters.monochromeFormatter,
    writers: [
      LogWriter.file(`${ROOT}/logs/feature.${name}.log`),
    ]
  })

```
You can narrow down the log levels each writer will print by specifying its own log level. This is useful if you only want error or fatal messages to be logged to disk, but still want warning levels printing to stdout.

```javascript
  featureLogger: name => ({
    enabled: !IS_DEV,
    formatter: Formatters.monochromeFormatter,
    writers: [
      LogWriter.file(`${ROOT}/logs/feature.${name}-error.log`, {
        level: LogLevel.ERROR
      }),
    ]
  })
```
Note that when specifying levels to writers, they will be constrained by the level set in the parent logger. For example, if you set the logger's level to `LogLevel.ERROR` only, and supply `LogLevel.INFO | LogLevel.ERROR` to a writer, only the error level messages will be printed because the parent logger does not allow info level messages to print. When Supplying a level constraint to writers, it's best to leave either the logger's level option empty to relegate the message filtering to the writers.

---

## Writer Options

Writers can accept an options object which is optional, and all properties provided are also optional

### `object` WriterOptions

| Property | Type | Description |
|---|---|---|
| `formatter` | `FormatProvider` | The function that builds the message from the `LogEntry` object provided |
| `level` | `LogLevel \| number` | The log level (or bitmask) to apply to this writer. Note that the level provided here is contingent on it being enabled in the parent logger.

### `object` FileWriterOptions

The file writer takes an options object with two additional optional properties:

| Property | Type | Description |
|---|---|---|
| `mode` | number | The permissions for the file being written to in octal notation. Defaults to `0o644` |
| `encoding` | string (`BufferEncoding`) | The encoding |

