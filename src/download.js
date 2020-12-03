const ytdl = require("ytdl-core");
// const exec = require("child_process").exec; // Used to execute shell commands
const ffmpeg = require("fluent-ffmpeg");
const Store = require("./config.js");
const electron = require('electron');
const path = require('path');

const downloadBtn = document.getElementById("download-btn");

const store = new Store({
    configName: "user-settings",
    defaults: {
        savePath: (electron.app || electron.remote.app).getPath("downloads"),
    },
});

let removeIllegalChars = (filepath) => {
  const illegal = /[\\/:*?\"<>|]/g;
  if (illegal.test(filepath)) {
    let newPath = filepath.replace(illegal, "");
    return newPath;
  } else {
    return filepath;
  }
};

let removeExtraURLInfo = (url) => {
  if (/&/.test(url)) {
    return url.split("&")[0];
  } else {
    return url;
  }
};

let createErrorElement = (error) => {
  let error_p;
  const downloader = document.getElementsByClassName("downloader")[0];
  if (document.getElementById("error-out") === null) {
    error_p = document.createElement("p");
    downloader.appendChild(error_p);
  } else {
    error_p = document.getElementById("error-out");
  }
  error_p.id = "error-out";
  if (error instanceof Error) {
    error_p.textContent = "Invalid YouTube link: ";
    error_p.textContent += error.message;
  }
};

const download = () => {
  let url = document.getElementById("url-box").value;
  let file_name = removeIllegalChars(document.getElementById("name-box").value);
  let file_path = path.join(store.get("savePath"), file_name + ".mp3");
  url = removeExtraURLInfo(url);
  
  try {
    var stream = ytdl(url, { filter: "audioonly" });
    ffmpeg(stream).save(file_path);
    document
      .getElementsByClassName("downloader")[0]
      .removeChild(document.getElementById("error-out"));
  } catch (error) {
    if (!(error instanceof TypeError)) {
      console.error(error);
      createErrorElement(error);
    }
  }
};

downloadBtn.addEventListener("click", (event) => {
  download();
});

(
  document.getElementById("url-box") && document.getElementById("name-box")
).addEventListener("keyup", (event) => {
  if (event.key == "Enter") {
    event.preventDefault();
    downloadBtn.click();
  }
});
