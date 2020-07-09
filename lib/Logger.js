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
    debug(message, ...args) {
        if (this.level <= LogLevel.Debug)
            console.log(this.build(LogLevel.Debug, this.inspect(message)), ...args.map(a => this.inspect(a)));
    }
    info(message, ...args) {
        if (this.level <= LogLevel.Info)
            console.log(this.build(LogLevel.Info, this.inspect(message)), ...args.map(a => this.inspect(a)));
    }
    warn(message, ...args) {
        if (this.level <= LogLevel.Warn)
            console.log(this.build(LogLevel.Warn, this.inspect(message)), ...args.map(a => this.inspect(a)));
    }
    error(message, ...args) {
        if (this.level <= LogLevel.Error)
            console.error(this.build(LogLevel.Error, this.inspect(message)), ...args.map(a => this.inspect(a)));
    }
    expand(depth) {
        const instance = new Logger(this.level, this.formatter);
        instance._inspect = true;
        instance._inspectDepth = depth || null;
        return instance;
    }
    force() {
        return new Logger(LogLevel.Debug, this.formatter);
    }
    inspect(arg) {
        return this._inspect ? util_1.inspect(arg, false, this._inspectDepth, true) : arg;
    }
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
