import fs from "fs";

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

export function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get the content type of a URL
 * @param url
 */
export function contentType(url : string) {
    if (url.endsWith(".css")) {
        return "text/css";
    } else if (url.endsWith(".js")) {
        return "text/javascript";
    } else {
        return "text/html";
    }
}

export function fileExists(file : string) {
    return fs.promises.access(file, fs.constants.F_OK)
        .then(() => true)
        .catch(() => false);
}

