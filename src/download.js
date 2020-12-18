const electron = require("electron");
const fetch = require("node-fetch");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const fs = require("fs");
const https = require('https');
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


/**
 * Downloads and saves a YouTube video
 * @param {string} url The URL of the YouTube video to be downloaded
 * @param {string} file_path The path to save the video at
 * @returns {Promise} A promise resolving with the file path and rejecting with an error
 */
var saveFile = (url, file_path) => {
  return new Promise(async (resolve, reject) => {
    var stream = ytdl(url, { filter: "audioonly" });
    ffmpeg(stream).save(file_path);

    stream.on("error", (err) => {
      reject(err);
    });

    var size = 0,
      mtime = 0;
    while (true) {
      try {
        var stats = fs.statSync(file_path);
      } catch (err) {
        await new Promise((r) => setTimeout(r, 500));
        continue;
      }
      if (!(stats.size == size || stats.mtime == mtime)) {
        size = stats.size;
        mtime = stats.mtime;
        await new Promise((r) => setTimeout(r, 500));
        continue;
      }
      console.log(`'${file_path}' saved successfully`);
      break;
    }
    resolve(file_path);
  });
};


/**
 * Parses HTML code for the title tag
 * @param {string} body HTML code for the body of a webpage
 * @returns {string} The title of the given HTML page
 */
const parseTitle = (body) => {
  let match = body.match(/<title>([^<]*)<\/title>/);
  return match[1];
};


/**
 * Checks if a URL exists on the web
 * @param {string} url Checks if the given URL exists on the internet
 * @returns {Promise} A promise resolving with the title of the webpage at the URL and rejecting with an error
 */
var urlExists = (url) => {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then((res) => res.text())
      .then((body) => resolve(parseTitle(body)))
      .catch((err) => reject(err));
  });
};

/**
 * 
 * @param {string} url URL to be downloaded from
 * @param {string} file_name File name to save the download to
 * @param {HTMLElement} status HTML element updated with the download status
 */
let listOptions = async (url, file_name, status) => {
  const store = new Store({
    configName: "user-settings",
    defaults: {
      savePath: electron.remote.app.getPath("downloads"),
    },
  });

  status.style.color = 'gray';
  status.innerHTML = "Checking URL..."
  let exists = await urlExists(url)
    .then((title) => {
      if (file_name.trim() != 0) {
        file_name = removeIllegalChars(file_name);
      } else {
        file_name = title.replace(" - YouTube", "")
      }
      status.innerHTML = "URL exists!";
      return true;
    })
    .catch((err) => {
      status.innerHTML = "<i>Error: URL does not exist.</i>";
      status.style.color = "#e01400";
      return false;
    });

    if (!exists) {
      return;
    }

    await ytdl.getBasicInfo(url).then((info) => {
      console.log(info.videoDetails.title);
    })
    console.log("found it!");
}


/**
 * Downloads a YouTube video
 */
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

  status.style.color = "gray";
  status.innerHTML = "Checking URL...";
  let exists = await urlExists(url)
    .then((title) => {
      if (file_name.trim().length != 0) {
        file_name = removeIllegalChars(file_name);
      } else {
        file_name = title.replace(" - YouTube", "");
      }
      status.innerHTML = "URL exists!";
      return true;
    })
    .catch((err) => {
      status.innerHTML = "<i>Error: URL does not exist.</i>";
      status.style.color = "#e01400";
      return false;
    });

  if (!exists) {
    return;
  }

  file_path = path.join(store.get("savePath"), file_name + ".mp3");
  url = removeExtraURLInfo(url);

  status.innerHTML = "<i>Downloading...</i>";
  status.style.color = "gray";

  saveFile(url, file_path)
    .then((save_path) => {
      status.innerHTML = `<i>${save_path} successfully saved</i>;`;
      status.style.color = "#00c210";
      electron.shell.showItemInFolder(file_path); // Opens the folder and highlights the file
    })
    .catch((error) => {
      status.innerHTML = "<i>Error: </i>";
      status.style.color = "#e01400";
      console.error(error);
      if (!(error instanceof TypeError)) {
        status.innerHTML += error.message;
      }
    });
};

downloadBtn.addEventListener("click", (event) => {
  download(document.getElementById("url-box").value);
});

document.getElementById('check-btn').addEventListener('click', (event) => {
  let status = document.getElementById("status"),
      url = document.getElementById("url-box").value,
      file_name = document.getElementById("name-box").value;
  
  listOptions(url, file_name, status);
});

[
  document.getElementById("url-box"),
  document.getElementById("name-box"),
].forEach((input) => {
  input.addEventListener("keyup", (event) => {
    if (event.key == "Enter") {
      event.preventDefault();
      downloadBtn.click();
    }
  });
});
