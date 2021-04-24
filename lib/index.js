"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const utils_1 = require("@nolawnchairs/utils");
const Log_1 = require("./Log");
const LoggerOutput_1 = require("./LoggerOutput");
const LogLevel_1 = require("./LogLevel");
const LoggerConfig_1 = require("./LoggerConfig");
const IS_DEV = process.env.NODE_ENV !== 'production';
const ROOT = path_1.default.resolve(__dirname, '..');
Log_1.Logger.init({
    eol: '\n',
    loggers: {
        debugger: {
            enabled: IS_DEV,
            level: LogLevel_1.LogLevel.DEBUG,
            serializationStrategy: LoggerConfig_1.ObjectSerializationStrategy.INSPECT,
            writers: [
                LoggerOutput_1.LogWriter.stdout(),
                LoggerOutput_1.LogWriter.file(`${ROOT}/logs/stdout.log`),
            ],
        },
        production: {
            enabled: !IS_DEV,
            level: LogLevel_1.LogLevel.ERROR,
            writers: [
                LoggerOutput_1.LogWriter.file(`${ROOT}/logs/error.log`, 666),
            ]
        }
    },
    defaults: {
        named: className => ({
            enabled: true,
            level: IS_DEV ? LogLevel_1.LogLevel.DEBUG : LogLevel_1.LogLevel.ERROR,
            serializationStrategy: LoggerConfig_1.ObjectSerializationStrategy.INSPECT,
            writers: [
                LoggerOutput_1.LogWriter.stdout(),
                LoggerOutput_1.LogWriter.file(`${ROOT}/logs/${className.toLowerCase()}.log`),
            ]
        })
    }
});
utils_1.Futures.delayed(100, () => {
    Log_1.Logger.debug('Testing %s', 123);
    Log_1.Logger.info('Testing Info %s', { value: true, other: 'things' });
    const featureLogger = Log_1.Logger.forFeature('Testing');
    featureLogger.info('This is for info');
    featureLogger.debug('This is a test for dedug');
    featureLogger.error('This is a test for an error');
    featureLogger.fatal('This is a test for a fatal error');
    featureLogger.warn('This is a test for a warning');
});
