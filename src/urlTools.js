const https = require('https');

/**
 * Removes any extra info after the watch ID in a YouTube link
 * @param {string} url The URL to be parsed
 * @returns {string} A link with only the watch ID attached
 */
let removeExtraURLInfo = (url) => {
    if (/&/.test(url)) {
      return url.split("&")[0];
    } else {
      return url;
    }
  };