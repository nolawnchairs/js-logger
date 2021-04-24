
import path from 'path'
import { Futures } from '@nolawnchairs/utils'
import { Logger } from './Log'
import { LogWriter } from './LoggerOutput'
import { LogLevel } from './LogLevel'
import { ObjectSerializationStrategy } from './LoggerConfig'

const IS_DEV = process.env.NODE_ENV !== 'production'
const ROOT = path.resolve(__dirname, '..')
Logger.init({
  eol: '\n',
  loggers: {
    debugger: {
      enabled: IS_DEV,
      level: LogLevel.DEBUG,
      serializationStrategy: ObjectSerializationStrategy.INSPECT,
      writers: [
        LogWriter.stdout(),
        LogWriter.file(`${ROOT}/logs/stdout.log`),
      ],
    },
    production: {
      enabled: !IS_DEV,
      level: LogLevel.ERROR,
      writers: [
        LogWriter.file(`${ROOT}/logs/error.log`, 666),
      ]
    }
  },
  defaults: {
    named: className => ({
      enabled: true,
      level: IS_DEV ? LogLevel.DEBUG : LogLevel.ERROR,
      serializationStrategy: ObjectSerializationStrategy.INSPECT,
      writers: [
        LogWriter.stdout(),
        LogWriter.file(`${ROOT}/logs/${className.toLowerCase()}.log`),
      ]
    })
  }
})

Futures.delayed(100, () => {
  Logger.debug('Testing %s', 123)
  Logger.info('Testing Info %s', { value: true, other: 'things' })
  const featureLogger = Logger.forFeature('Testing')
  featureLogger.info('This is for info')
  featureLogger.debug('This is a test for dedug')
  featureLogger.error('This is a test for an error')
  featureLogger.fatal('This is a test for a fatal error')
  featureLogger.warn('This is a test for a warning')
})
