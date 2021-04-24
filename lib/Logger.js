"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LogLevel = void 0;
const util_1 = require("util");
const pid = process.pid.toString();
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["Debug"] = 0] = "Debug";
    LogLevel[LogLevel["Info"] = 1] = "Info";
    LogLevel[LogLevel["Warn"] = 2] = "Warn";
    LogLevel[LogLevel["Error"] = 3] = "Error";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
// Colorizers
const colorizers = {
    green: (text) => '\x1b[32m' + text + '\x1b[0m',
    cyan: (text) => '\x1b[36m' + text + '\x1b[0m',
    yellow: (text) => '\x1b[33m' + text + '\x1b[0m',
    red: (text) => '\x1b[41m' + text + '\x1b[0m',
    grey: (text) => '\x1b[30;1m' + text + '\x1b[0m',
    custom: (text, ansiValue) => {
        return '\x1b[' + ansiValue.toString() + 'm' + text + '\x1b[0m';
    },
    levelDefault: (level, text) => {
        const [levelTextValue, levelColorizer] = levels[level];
        return levelColorizer(text || levelTextValue);
    }
};
const levels = [
    ['DEBUG', colorizers.green],
    ['INFO ', colorizers.cyan],
    ['WARN ', colorizers.yellow],
    ['ERROR', colorizers.red],
];
class Logger {
    /**
     * Creates an instance of Logger
     *
     * @param {LogLevel} level the logging level
     * @param {FormatterSupplier} [formatter] the output formatter
     * @memberof Logger
     */
    constructor(level, formatter) {
        this.level = level;
        this.formatter = formatter;
        this._inspect = false;
        if (!formatter) {
            this.formatter = e => {
                const [levelValue, levelColorizer] = levels[e.level];
                return colorizers.grey(e.date.toISOString()) + ' ' +
                    e.pid + ' ' + levelColorizer(levelValue) + ' | ' + e.message;
            };
        }
    }
    /**
     * Emit a debug message to stdout
     *
     * @param {*} [message] the message
     * @param {...any[]} args additional arguments
     * @memberof Logger
     */
    debug(message, ...args) {
        if (this.level <= LogLevel.Debug)
            console.log(this.build(LogLevel.Debug, this.inspect(message)), ...args.map(a => this.inspect(a)));
    }
    /**
     * Emit an info message to stdout
     *
     * @param {*} [message] the message
     * @param {...any[]} args additional arguments
     * @memberof Logger
     */
    info(message, ...args) {
        if (this.level <= LogLevel.Info)
            console.log(this.build(LogLevel.Info, this.inspect(message)), ...args.map(a => this.inspect(a)));
    }
    /**
     * Emit a warning message to stdout
     *
     * @param {*} [message] the message
     * @param {...any[]} args additional arguments
     * @memberof Logger
     */
    warn(message, ...args) {
        if (this.level <= LogLevel.Warn)
            console.log(this.build(LogLevel.Warn, this.inspect(message)), ...args.map(a => this.inspect(a)));
    }
    /**
     * Emit an error message to stderr
     *
     * @param {*} [message] the message
     * @param {...any[]} args additional arguments
     * @memberof Logger
     */
    error(message, ...args) {
        if (this.level <= LogLevel.Error)
            console.error(this.build(LogLevel.Error, this.inspect(message)), ...args.map(a => this.inspect(a)));
    }
    /**
     * Clones the instance of the current logger with
     * one that will inspect nested arrays and objects,
     *
     * @param {number} [depth] the depth to inspect. default null (entire depth)
     * @returns {Logger} the new logger instance
     * @memberof Logger
     */
    expand(depth) {
        const instance = new Logger(this.level, this.formatter);
        instance._inspect = true;
        instance._inspectDepth = depth || null;
        return instance;
    }
    /**
     * Clones the instance of the current logger with
     * one that will print any level regardless of the level
     * set by default
     *
     * @returns {Logger} the new logger instance
     * @memberof Logger
     */
    force() {
        return new Logger(LogLevel.Debug, this.formatter);
    }
    inspect(arg) {
        return this._inspect ? util_1.inspect(arg, false, this._inspectDepth, true) : arg;
    }
    /**
     * Builds the log message using the formatter supplied
     *
     * @private
     * @param {LogLevel} level the level to log
     * @param {*} [message] the message
     * @returns {string} the formatted message
     * @memberof Logger
     */
    build(level, message) {
        const [levelValue] = levels[level];
        return this.formatter({
            date: new Date(),
            levelValue,
            level,
            pid,
            message
        }, colorizers);
    }
}
exports.Logger = Logger;
