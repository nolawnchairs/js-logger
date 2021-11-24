const path = require('path')
const { LogLevel, Log, ObjectSerializationStrategy, Formatters, LogWriter } = require(".")

const IS_DEV = process.env.NODE_ENV !== 'production'
const ROOT = path.resolve(__dirname)

Log.init({
  global: {
    inspectionColor: true,
    assertionLevel: LogLevel.ERROR,
    assertionsEnabled: true,
  },
  providers: {
    globalLoggers: {
      development: () => ({
        enabled: IS_DEV,
        level: LogLevel.DEBUG,
        serializationStrategy: ObjectSerializationStrategy.INSPECT,
        writers: [
          LogWriter.stdout({ level: LogLevel.ERROR | LogLevel.WARN }),
          LogWriter.file(`${ROOT}/logs/global-json.log`, { formatter: Formatters.jsonFormatter })
        ]
      })
    },
    featureLogger: () => ({
      //enabled: false,
      //level: LogLevel.DEBUG,
      serializationStrategy: ObjectSerializationStrategy.INSPECT,
      writers: [
        LogWriter.stdout({ level: LogLevel.INFO | LogLevel.ERROR }),
        LogWriter.file(`${ROOT}/logs/named-monochrome.log`, { formatter: Formatters.monochromeFormatter }),
        LogWriter.file(`${ROOT}/logs/named-json.log`, { formatter: Formatters.jsonFormatter })
      ]
    })
  }
})

// Log.debug('Debugging...')
// Log.debug([1, 2, 3])
// Log.info('Testing %s', 123)
// Log.warn({ stuff: [3, 4] })
// Log.error('Testing Info %s', { value: true, other: 'things' })

// const [a, b] = [1, 0]
// Log.assert(a === b, '%d should equal %d', a, b)

// const [c, d] = [1, 1]
// Log.assert(c === d, '%d should equal %d', c, d)

const featureLogger = Log.forFeature('Test')
featureLogger.debug('Debug')
featureLogger.info('Info')
featureLogger.warn('Warning')
featureLogger.error('Error')
featureLogger.fatal('Fatal error')
featureLogger.assert(1 == 0, '%d should equal %d', 1, 0)
