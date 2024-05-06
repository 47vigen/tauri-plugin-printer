import { Buffer } from "buffer";
// Utility function to decode base64-encoded strings
export const decodeBase64 = (str) => typeof atob === "function"
    ? atob(str)
    : Buffer.from(str, "base64").toString("utf-8");
// Utility function to encode strings to base64
export const encodeBase64 = (str) => typeof btoa === "function" ? btoa(str) : Buffer.from(str).toString("base64");
// Utility function to parse JSON safely
export const parseIfJSON = (str, defaultValue = []) => {
    try {
        return JSON.parse(str);
    }
    catch {
        return defaultValue;
    }
};
