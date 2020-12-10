const ytdl = require("ytdl-core");
// const exec = require("child_process").exec; // Used to execute shell commands
const ffmpeg = require("fluent-ffmpeg");
const Store = require("./config.js");
const electron = require('electron');
const path = require('path');
const fs = require('fs');

const downloadBtn = document.getElementById("download-btn");

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

var saveFile = async (url, file_path) => {
  var stream = ytdl(url, { filter: "audioonly" });
  ffmpeg(stream).save(file_path);
  var size = 0, mtime = 0;
  while (true) {
    try {
      var stats = fs.statSync(file_path);
    } catch (err) {
      await new Promise(r => setTimeout(r, 500));
      continue;
    }
    if (!(stats.size == size || stats.mtime == mtime)) {
      size = stats.size;
      mtime = stats.mtime;
      await new Promise(r => setTimeout(r, 500));
      continue;
    }
    console.log("done");
    break;
  }
  return 0;
}

const download = () => {
  const store = new Store({
    configName: "user-settings",
    defaults: {
        savePath: electron.remote.app.getPath("downloads"),
      },
  });
  let status = document.getElementById('status');
  let url = document.getElementById("url-box").value;
  let file_name = document.getElementById("name-box").value;
  if (file_name.trim().length != 0) {
    file_name = removeIllegalChars(file_name);
  } else {
    file_name = "youtube download";
  }
  let file_path = path.join(store.get("savePath"), file_name + ".mp3");
  url = removeExtraURLInfo(url);

  status.innerHTML = "<i>Downloading...</i>"
  
  try {
    saveFile(url, file_path).then(() => {
      status.innerHTML = "<i>Done!</i>";
    });
  } catch (error) {
    status.innerHTML = "<i>Error</i>"
    console.error(error);
    if (!(error instanceof TypeError)) {
      createErrorElement(error);
    }
  }
};

downloadBtn.addEventListener("click", (event) => {
  download();
});

[document.getElementById('url-box'), document.getElementById('name-box')].forEach(input => {
  input.addEventListener('keyup', event => {
    if (event.key == "Enter") {
      event.preventDefault();
      downloadBtn.click();
    }
  })
});
