const path = require('path')
const { LogLevel, Log, ObjectSerializationStrategy, Formatters, LogWriter } = require(".")

const IS_DEV = process.env.NODE_ENV !== 'production'
const ROOT = path.resolve(__dirname)

Log.init({
  global: {
    inspectionColor: true,
  },
  providers: {
    globalLoggers: {
      development: () => ({
        enabled: IS_DEV,
        level: LogLevel.DEBUG,
        serializationStrategy: ObjectSerializationStrategy.INSPECT,
        writers: [
          LogWriter.stdout(),
          LogWriter.file(`${ROOT}/logs/stdout.log`, { formatter: Formatters.jsonFormatter })
        ]
      })
    },
    featureLogger: () => ({
      enabled: true,
      level: IS_DEV ? LogLevel.DEBUG : LogLevel.ERROR,
      serializationStrategy: ObjectSerializationStrategy.INSPECT,
      writers: [
        LogWriter.stdout({ formatProvider: (e) => `${e.message}` }),
        LogWriter.file(`${ROOT}/logs/named.log`, { formatter: Formatters.monochromeFormatter }),
      ]
    })
  }
})

Log.info('Testing %s', 123)
Log.info({ stuff: [3, 4] })
Log.info('Testing Info %s', { value: true, other: 'things' })
const featureLogger = Log.forFeature('LoggerProvider')
featureLogger.info('This is a test for debug %s', 'a string')
featureLogger.info('This is for info')
featureLogger.warn('This is a test for a warning')
featureLogger.error('This is a test for an error')
featureLogger.fatal('This is a test for a fatal error')
