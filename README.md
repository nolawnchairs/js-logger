# Logger v3

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

Set up your logging environments using the `init` method. The `providers.globalLoggers` object must contain one object where the key is any unique name you like (it's how the internal registry identifies it), and the value is a function that returns the configuration for this logger:

```javascript
Log.init({
  providers: {
    globalLoggers: {
      development: () => ({
        enabled: process.env.NODE_ENV === 'development',
        level: LogLevel.DEBUG,
        serializationStrategy: ObjectSerializationStrategy.INSPECT,
        writers: [
          LogWriter.stdout()
        ]
      })
    }
  }
})
```

In the above example, we define a single `globalLogger`. The name we give this logger is `development`, and it returns a `LoggerConfigInstance` object. Here, the `enabled` key is set based on whether or not we're in development mode, we set the `level` to `DEBUG`, set a serialization strategy (which dictates how non-scalar values are treated when printing), and an array of `LogWriter` instances that define where the logging output goes.

To log, we simply call the desired level with a message:



## Global vs Feature Loggers

Global loggers are availble throughout your project and are logged to using the standard `Log` interface as such:

```javascript
Log.info('This is a test message')
```

Feature Loggers are only available within the class or module in which they are defined, and accept a `string` value that will identify where the message came from. This is useful in larger projects, since the message will give you context as to where it was printed. 

Feature Loggers require configuration just like Global Loggers do. You can either pass configuration to each one you create, or you can create a default configuration for all Feature Loggers that don't provide configuration themselves:

```javascript
const IS_DEV = process.env.NODE_ENV === 'development'

Log.init({
  providers: {
    globalLoggers: {...},
    featureLogger: name => ({
      enabled: true,
      level: IS_DEV ? LogLevel.DEBUG : LogLevel.ERROR,
      serializationStrategy: ObjectSerializationStrategy.INSPECT,
      writers: [
        LogWriter.stdout(),
        LogWriter.file(`${ROOT}/logs/feature.${name}.log`, { formatProvider: Formatters.monochromeFormatter }),
      ]
    })  
  }
})
```

In this example, we set `enabled` to true, but set the `level` dependent on the `NODE_ENV` value. Instead of a single `LogWriter`, we specify two - one for the console, and one that logs to a file. Note that we're using a `formatProvider` to write monochrome, since we don't normally want ANSI colors present in our disk logs.

Creating a Feature Logger is simple. We call the `forFeature` method on the main `Log` interface as such:

```javascript
const logger = Log.forFeature('SomeClassName')
logger.info('This is from a class or module')
```

---
### `enum` LogLevel

The `LogLevel` enum contains the following values:

* `DEBUG`
* `INFO`
* `WARN`
* `ERROR`
* `FATAL`

Each logger instance contains idential methods for each:
`debug`, `info`, `warn`, `error` and `fatal`

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
      yourLoggername: () => LoggerConfigInstance
      anotherLogger: () => LoggerConfigInstance
    }
    featureLogger: () => LoggerConfigInstance
  }
}
```

### `interface` LoggerGlobalConfig

The following values can be set to the `global` object, and will provide default values to all your other loggers

| Property | Type | Description | Required |
| ----------- | ----------- | -------- | :--------: |
| `eol` | string | The end-of-line charachter. Defaults to `\n`  ||
| `serializationStrategy` | `ObjectSerializationStrategy` | How non-scalar values will be printed. Defaults to `INSPECT` ||
| `inspectionDepth` | number | The depth of serialization when using the `INSPECT` strategy. Defaults to `3` || 
| `inspectionColor` | boolean | Used in the `INSPECT` strategy, governs whether or not to color the inspected object ||
| `formatter` | `FormatProvider` | Defines a custom formatter for all `LogWriters` for this logger. Note that writers can override this setting with their own formatting ||


---

### `interface` LoggerConfigInstance

Each individial logger you define must be configured with the following properties.


| Property | Type | Description | Required |
| ----------- | ----------- | -------- | :--------: |
| `enabled` | boolean | Whether this logger will produce data | ✔️ |
| `level` | `LogLevel or number` | The level this logger will adhere to. Use a `LogLevel` enum value or an or'ed mask of multiple levels to use in unison<sup>1</sup> | ✔️ |
| `writers` | `LogWriter[]` | An array of `LogWriter` instances to use with this logger |✔️| 

In addition to the above properties, the `LoggerConfigInstance` will accept any of the properties defined in `LoggerGlobalConfig`, which will override any default values you set in `global`.


#### Notes
<sup>1</sup> Specifying a single level will print anything from the defined level, **UP**. Meaning that a `WARN` level will print `WARN`, `ERROR` and `FATAL`, but not `INFO` or `DEBUG`. You can, however, define log level in a non-contiguous manner by masking two levels together:

```javascript
{
  level: LogLevel.INFO | LogLevel.ERROR
}
```
The above configuration will ONLY print `INFO` or `ERROR` messages, and nothing else

