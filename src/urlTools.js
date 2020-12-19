const https = require('https');
const ytdl = require('ytdl-core');

/**
 * Removes any extra info after the watch ID in a YouTube link
 * @param {string} url The URL to be parsed
 * @returns {string} A link with only the watch ID attached
 */
let removeExtraYTInfo = (url) => {
    if (/&/.test(url)) {
      return url.split("&")[0];
    } else {
      return url;
    }
  };

/**
 * Checks if a URL exists on the internet
 * @param {string} url URL
 */
let urlExists = (url) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            res.on('data', (d) => {
                resolve(true);
            });
        }).on('error', (e) => {
            reject(e);
        });
    });
}

module.exports = {removeExtraYTInfo, urlExists}
