const electron = require("electron");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const fs = require("fs");
const https = require("https");
const path = require("path");
const Store = require("./config.js");
const ytdl = require("ytdl-core");

const downloadBtn = document.getElementById("download-btn");
ffmpeg.setFfmpegPath(ffmpegPath); // ffmpeg is a built-in package and needs its path manually set

/**
 * Removes characters deemed illegal for usage in file naming
 * @param {string} filepath The file path that needs to be parsed
 * @returns {string} A legal string
 */
let removeIllegalChars = (filepath) => {
  const illegal = /[\\/:*?\"<>|]/g;
  if (illegal.test(filepath)) {
    let newPath = filepath.replace(illegal, "");
    return newPath;
  } else {
    return filepath;
  }
};

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

let download = async () => {
  const store = new Store({
    configName: "user-settings",
    defaults: {
      savePath: electron.remote.app.getPath("downloads"),
    },
  });

  let status = document.getElementById("status"),
    url = document.getElementById("url-box").value,
    file_name = document.getElementById("name-box").value;
};
