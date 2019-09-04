"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
const proc = require("process");
const pid = chalk_1.default.yellowBright(proc.pid.toString());
var LevelCardinality;
(function (LevelCardinality) {
    LevelCardinality[LevelCardinality["Debug"] = 0] = "Debug";
    LevelCardinality[LevelCardinality["Info"] = 1] = "Info";
    LevelCardinality[LevelCardinality["Warn"] = 2] = "Warn";
    LevelCardinality[LevelCardinality["Error"] = 3] = "Error";
})(LevelCardinality || (LevelCardinality = {}));
const colors = {
    debug: chalk_1.default.greenBright,
    info: chalk_1.default.blueBright,
    warn: chalk_1.default.yellowBright,
    error: chalk_1.default.redBright
};
class Logger {
    set appName(appName) { this._appName = appName; }
    set level(level) { this._level = level; }
    set options(options) { this._options = options; }
    debug(message, ...args) {
        if (this._level <= LevelCardinality.Debug)
            this.log(message, 'debug', ...args);
    }
    info(message, ...args) {
        if (this._level <= LevelCardinality.Info)
            this.log(message, 'info', ...args);
    }
    warn(message, ...args) {
        if (this._level <= LevelCardinality.Warn)
            this.log(message, 'warn', ...args);
    }
    error(message, ...args) {
        if (this._level <= LevelCardinality.Error)
            this.log(message, 'error', ...args);
    }
    markColor(level, text) {
        return colors[level](text);
    }
    getLevelMark(level) {
        if (this._options.printLevel) {
            if (this._options.printLevel == 'full') {
                return this.markColor(level, strpad(level.toUpperCase(), 5));
            }
            return this.markColor(level, level.toUpperCase().charAt(0));
        }
    }
    log(message, level, ...args) {
        const time = new Date().toISOString();
        const appName = this.markColor(level, this._appName);
        const levelMark = this.getLevelMark(level);
        const items = [
            time,
            pid,
            levelMark,
            appName,
            message
        ];
        console.log(items.filter(i => !!i).join(' '), ...args);
    }
}
const instance = new Logger();
function createLoggerInstance(appName, level, options) {
    instance.appName = appName;
    instance.level = getLevelCardinality(level);
    instance.options = Object.assign({}, options);
    return instance;
}
function strpad(text, size) {
    let s = text;
    while (s.length < size)
        s = s + ' ';
    return s;
}
function getLevelCardinality(level) {
    const i = ['debug', 'info', 'warn', 'error'].indexOf(level);
    return i > -1 ? i : LevelCardinality.Error;
}
exports.default = createLoggerInstance;
