"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const util_1 = require("util");
const sprintf_js_1 = require("sprintf-js");
const LoggerConfig_1 = require("./LoggerConfig");
const LoggerFormat_1 = require("./LoggerFormat");
const LogLevel_1 = require("./LogLevel");
var Logger;
(function (Logger) {
    const globalConfig = {};
    const globalLoggers = new Map();
    const providerTemplates = new Map();
    function init(_a) {
        var _b, _c, _d;
        var { loggers, defaults } = _a, rest = __rest(_a, ["loggers", "defaults"]);
        for (const logger of Object.keys(loggers)) {
            const config = loggers[logger];
            const instance = new Log({
                config,
                eol: (_b = config.eol) !== null && _b !== void 0 ? _b : rest.eol,
                formatter: (_c = config.formatter) !== null && _c !== void 0 ? _c : rest.formatter,
                inspectionDepth: (_d = config.inspectionDepth) !== null && _d !== void 0 ? _d : 3
            });
            globalLoggers.set(logger, instance);
        }
        if (defaults.named)
            providerTemplates.set('named', defaults.named);
        if (defaults.module)
            providerTemplates.set('module', defaults.module);
        globalConfig.eol = rest.eol;
        globalConfig.formatter = rest.formatter;
        globalConfig.inspectionDepth = rest.inspectionDepth;
    }
    Logger.init = init;
    function forFeature(name, config) {
        return create('named', name, config);
    }
    Logger.forFeature = forFeature;
    function forModule(name, config) {
        return create('module', name, config);
    }
    Logger.forModule = forModule;
    function create(defaultId, meta, config) {
        var _a, _b;
        let loggerConfig;
        if (!config) {
            const findConfig = providerTemplates.get(defaultId);
            if (!findConfig)
                throw new Error(`Named logger for '${meta}' could not be initialized. No default configuration found`);
            loggerConfig = findConfig(meta);
        }
        return new Log({
            config: loggerConfig,
            eol: (_a = loggerConfig.eol) !== null && _a !== void 0 ? _a : globalConfig.eol,
            formatter: (_b = loggerConfig.formatter) !== null && _b !== void 0 ? _b : globalConfig.formatter,
            meta,
        });
    }
    function debug(message, ...args) {
        globalLoggers.forEach(log => log.debug(message, args));
    }
    Logger.debug = debug;
    function info(message, ...args) {
        globalLoggers.forEach(log => log.info(message, args));
    }
    Logger.info = info;
    function warning(message, ...args) {
        globalLoggers.forEach(log => log.warn(message, args));
    }
    Logger.warning = warning;
    function error(message, ...args) {
        globalLoggers.forEach(log => log.error(message, args));
    }
    Logger.error = error;
    function fatal(message, ...args) {
        globalLoggers.forEach(log => log.fatal(message, args));
    }
    Logger.fatal = fatal;
})(Logger = exports.Logger || (exports.Logger = {}));
const serialziers = {
    [LoggerConfig_1.ObjectSerializationStrategy.OMIT]: () => '',
    [LoggerConfig_1.ObjectSerializationStrategy.INSPECT]: (value, props) => util_1.inspect(value, true, props.inspectionDepth, false),
    [LoggerConfig_1.ObjectSerializationStrategy.JSON]: value => JSON.stringify(value)
};
class TextBuilder {
    constructor(message, args, config) {
        this.message = message;
        this.args = args;
        this.config = config;
    }
    toString() {
        return sprintf_js_1.vsprintf(this.message, this.args.map(a => {
            return typeof a == 'object'
                ? serialziers[this.config.serializationStrategy](a, this.config)
                : a;
        }));
    }
}
class Log {
    constructor(properties) {
        var _a, _b;
        this.config = properties.config;
        this.eol = (_a = properties.eol) !== null && _a !== void 0 ? _a : '\n';
        this.formatter = (_b = properties.formatter) !== null && _b !== void 0 ? _b : LoggerFormat_1.LoggerFormat.defaultFormatter;
        this.meta = properties.meta;
    }
    debug(message, ...args) {
        if (this.canPrint(LogLevel_1.LogLevel.DEBUG)) {
            this.print(LogLevel_1.LogLevel.DEBUG, new TextBuilder(message, args, this.config).toString());
        }
    }
    info(message, ...args) {
        if (this.canPrint(LogLevel_1.LogLevel.INFO)) {
            this.print(LogLevel_1.LogLevel.INFO, new TextBuilder(message, args, this.config).toString());
        }
    }
    warn(message, ...args) {
        if (this.canPrint(LogLevel_1.LogLevel.WARN)) {
            this.print(LogLevel_1.LogLevel.WARN, new TextBuilder(message, args, this.config).toString());
        }
    }
    error(message, ...args) {
        if (this.canPrint(LogLevel_1.LogLevel.ERROR)) {
            this.print(LogLevel_1.LogLevel.ERROR, new TextBuilder(message, args, this.config).toString());
        }
    }
    fatal(message, ...args) {
        if (this.canPrint(LogLevel_1.LogLevel.FATAL)) {
            this.print(LogLevel_1.LogLevel.FATAL, new TextBuilder(message, args, this.config).toString());
        }
    }
    canPrint(level) {
        if (!this.config.enabled)
            return false;
        return this.config.exclusive
            ? !!(level & this.config.level)
            : level >= this.config.level;
    }
    print(level, text) {
        const out = this.formatter(LoggerFormat_1.LoggerFormat.createLogEntry(level, text, this.meta));
        this.config.writers.forEach(w => w.write(out + this.eol));
    }
}
