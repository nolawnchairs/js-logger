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
class Logger {
    constructor() {
        const appName = require(__dirname + "./../package.json").name;
        this.mark = {
            debug: chalk_1.default.greenBright(appName),
            info: chalk_1.default.blueBright(appName),
            warn: chalk_1.default.yellow(appName),
            error: chalk_1.default.redBright(appName)
        };
    }
    debug(message, ...args) {
        if (this.level <= LevelCardinality.Debug)
            this.log(message, this.mark.debug, ...args);
    }
    info(message, ...args) {
        if (this.level <= LevelCardinality.Info)
            this.log(message, this.mark.info, ...args);
    }
    warn(message, ...args) {
        if (this.level <= LevelCardinality.Warn)
            this.log(message, this.mark.warn, ...args);
    }
    error(message, ...args) {
        if (this.level <= LevelCardinality.Error)
            this.log(message, this.mark.error, ...args);
    }
    log(message, mark, ...args) {
        const time = new Date().toISOString();
        console.log(`${time} ${pid} ${mark} ${message}`, ...args);
    }
}
const instance = new Logger();
function createLoggerInstance(appName, level) {
    instance.mark.debug = chalk_1.default.greenBright(appName);
    instance.mark.info = chalk_1.default.blueBright(appName);
    instance.mark.warn = chalk_1.default.yellow(appName);
    instance.mark.error = chalk_1.default.redBright(appName);
    instance.level = getLevelCardinality(level);
    return instance;
}
function getLevelCardinality(level) {
    const i = ['debug', 'info', 'warn', 'error'].indexOf(level);
    return i > -1 ? i : LevelCardinality.Error;
}
exports.default = createLoggerInstance;
