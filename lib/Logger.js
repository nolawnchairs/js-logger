"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pid = process.pid.toString();
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["Debug"] = 0] = "Debug";
    LogLevel[LogLevel["Info"] = 1] = "Info";
    LogLevel[LogLevel["Warn"] = 2] = "Warn";
    LogLevel[LogLevel["Error"] = 3] = "Error";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
const levels = [
    '\x1b[32mDEBUG\x1b[0m',
    '\x1b[36mINFO \x1b[0m',
    '\x1b[33mWARN \x1b[0m',
    '\x1b[41mERROR\x1b[0m'
];
class Logger {
    constructor(level, formatter) {
        this.level = level;
        this.formatter = formatter;
        if (!formatter) {
            this.formatter = e => '\x1b[30;1m' + e.date.toISOString() + '\x1b[0m ' +
                e.pid + ' ' + e.level + ' | ' + e.message;
        }
    }
    debug(message, ...args) {
        if (this.level <= LogLevel.Debug)
            console.log(this.build(LogLevel.Debug, message), ...args);
    }
    info(message, ...args) {
        if (this.level <= LogLevel.Info)
            console.log(this.build(LogLevel.Info, message), ...args);
    }
    warn(message, ...args) {
        if (this.level <= LogLevel.Warn)
            console.log(this.build(LogLevel.Warn, message), ...args);
    }
    error(message, ...args) {
        if (this.level <= LogLevel.Error)
            console.error(this.build(LogLevel.Error, message), ...args);
    }
    build(level, message) {
        return this.formatter({
            date: new Date(),
            level: levels[level],
            pid,
            message
        });
    }
}
exports.Logger = Logger;
