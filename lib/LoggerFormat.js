"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerFormat = exports.AnsiColors = void 0;
const LogLevel_1 = require("./LogLevel");
var AnsiColors;
(function (AnsiColors) {
    AnsiColors["RESET"] = "\u001B[0m";
    AnsiColors["BLACK"] = "\u001B[30m";
    AnsiColors["GRAY"] = "\u001B[30;1m";
    AnsiColors["WHITE"] = "\u001B[37m";
    AnsiColors["RED"] = "\u001B[31m";
    AnsiColors["GREEN"] = "\u001B[32m";
    AnsiColors["YELLOW"] = "\u001B[33m";
    AnsiColors["BLUE"] = "\u001B[34m";
    AnsiColors["MAGENTA"] = "\u001B[35m";
    AnsiColors["CYAN"] = "\u001B[36m";
    AnsiColors["BRIGHT_RED"] = "\u001B[31;1m";
    AnsiColors["BRIGHT_GREEN"] = "\u001B[32;1m";
    AnsiColors["BRIGHT_YELLOW"] = "\u001B[33;1m";
    AnsiColors["BRIGHT_BLUE"] = "\u001B[34;1m";
    AnsiColors["BRIGHT_MAGENTA"] = "\u001B[35;1m";
    AnsiColors["BRIGHT_CYAN"] = "\u001B[36;1m";
    AnsiColors["BRIGHT_WHITE"] = "\u001B[37;1m";
    AnsiColors["BRIGHT_BLACK"] = "\u001B[30;1m";
    AnsiColors["BG_BRIGHT_RED"] = "\u001B[41;1m";
})(AnsiColors = exports.AnsiColors || (exports.AnsiColors = {}));
const levels = {
    [LogLevel_1.LogLevel.DEBUG]: ['DEBUG', AnsiColors.BRIGHT_GREEN],
    [LogLevel_1.LogLevel.INFO]: [' INFO', AnsiColors.BRIGHT_BLUE],
    [LogLevel_1.LogLevel.WARN]: [' WARN', AnsiColors.BRIGHT_YELLOW],
    [LogLevel_1.LogLevel.ERROR]: ['ERROR', AnsiColors.BRIGHT_RED],
    [LogLevel_1.LogLevel.FATAL]: ['FATAL', AnsiColors.BG_BRIGHT_RED],
};
var LoggerFormat;
(function (LoggerFormat) {
    const pid = process.pid;
    function createLogEntry(level, message, meta) {
        return {
            date: new Date(),
            level,
            levelValue: levels[level][0],
            message,
            pid: pid.toString(10),
            meta,
        };
    }
    LoggerFormat.createLogEntry = createLogEntry;
    function colorize(color, text) {
        return color + text + AnsiColors.RESET;
    }
    LoggerFormat.colorize = colorize;
    function defaultFormatter(e) {
        const [levelValue, levelColorizer] = levels[e.level];
        return [
            colorize(AnsiColors.GRAY, e.date.toISOString()),
            e.pid,
            colorize(levelColorizer, levelValue),
            e.meta ? colorize(AnsiColors.CYAN, e.meta) + ' ' + colorize(AnsiColors.GRAY, '|') : colorize(AnsiColors.GRAY, '|'),
            e.message
        ].filter(s => !!s).join(' ');
    }
    LoggerFormat.defaultFormatter = defaultFormatter;
    function monochromeFormatter(e) {
        const [levelValue] = levels[e.level];
        return [
            e.date.toISOString(),
            e.pid,
            levelValue,
            e.meta ? e.meta + ' |' : '|',
            e.message
        ].filter(s => !!s).join(' ');
    }
    LoggerFormat.monochromeFormatter = monochromeFormatter;
})(LoggerFormat = exports.LoggerFormat || (exports.LoggerFormat = {}));
