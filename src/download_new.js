const electron = require("electron");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const fs = require("fs");
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
