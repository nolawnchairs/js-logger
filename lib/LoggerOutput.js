"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogWriter = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const Util_1 = require("./Util");
class LogWriter {
    constructor(writerProvider) {
        this.writerProvider = writerProvider;
    }
    static stdout() {
        return new LogWriter(() => Promise.resolve(process.stdout));
    }
    static stderr() {
        return new LogWriter(() => Promise.resolve(process.stderr));
    }
    static file(filePath, mode = 644) {
        return new LogWriter(() => __awaiter(this, void 0, void 0, function* () {
            const file = path_1.resolve(filePath);
            try {
                yield Util_1.assertFile(file);
                return fs_1.createWriteStream(file, { mode, encoding: 'utf-8', flags: 'a' });
            }
            catch (e) {
                throw new Error(`Could not create log file: ${file} (${e.message})`);
            }
        }));
    }
    write(value) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.writer)
                this.writer = yield this.writerProvider();
            this.writer.write(value, err => { });
        });
    }
}
exports.LogWriter = LogWriter;
