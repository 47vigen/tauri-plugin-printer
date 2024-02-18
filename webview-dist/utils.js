"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseIfJSON = exports.encodeBase64 = exports.decodeBase64 = void 0;
const buffer_1 = require("buffer");
// Utility function to decode base64-encoded strings
const decodeBase64 = (str) => typeof atob === "function"
    ? atob(str)
    : buffer_1.Buffer.from(str, "base64").toString("utf-8");
exports.decodeBase64 = decodeBase64;
// Utility function to encode strings to base64
const encodeBase64 = (str) => typeof btoa === "function" ? btoa(str) : buffer_1.Buffer.from(str).toString("base64");
exports.encodeBase64 = encodeBase64;
// Utility function to parse JSON safely
const parseIfJSON = (str, defaultValue = []) => {
    try {
        return JSON.parse(str);
    }
    catch {
        return defaultValue;
    }
};
exports.parseIfJSON = parseIfJSON;
