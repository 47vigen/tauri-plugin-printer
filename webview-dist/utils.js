"use strict";
// import { Buffer } from "buffer"
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseIfJSON = exports.encodeBase64 = exports.decodeBase64 = void 0;
// Utility function to decode base64-encoded strings
const decodeBase64 = (str) => typeof atob === "function" ? atob(str) : "";
exports.decodeBase64 = decodeBase64;
// : Buffer.from(str, "base64").toString("utf-8")
// Utility function to encode strings to base64
const encodeBase64 = (str) => typeof btoa === "function" ? btoa(str) : "";
exports.encodeBase64 = encodeBase64;
//  Buffer.from(str).toString("base64")
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
