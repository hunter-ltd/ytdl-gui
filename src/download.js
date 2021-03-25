const AudioFile = require("./audiofile.js");
const electron = require("electron");
const path = require("path");
const Store = require("./config.js");
const Video = require("./video.js");
const ytdl = require("ytdl-core");

const downloadBtn = document.getElementById("download-btn");

/**
 * Changes an HTML element to represent the status of a function
 * @param {HTMLElement} status_element Element representing status
 * @param {string} message Status message
 * @param {string} color Status element color
 */
let updateStatus = (status_element, message, color = "gray") => {
  status_element.style.color = color;
  status_element.innerHTML = message;
};

/**
 * Removes any extra info after the watch ID in a YouTube URL
 * @param {string} url The URL to be parsed
 * @returns {string} URL with only the watch ID attached
 */
let removeExtraYTInfo = (url) => {
  if (/&/.test(url)) {
    return url.split("&")[0];
  } else {
    return url;
  }
};

/**
 * Downloads a YouTube video
 * @param {string} url Video URL
 * @param {string} file_name File name
 */
let download = async (url, file_name) => {
  const store = new Store({
    configName: "user-settings",
    defaults: {
      savePath: electron.remote.app.getPath("downloads"), // Kinda frowned upon, but should be ok for this
    },
  });
  const status = document.getElementById("status");
  // Not all errors reject the promise. Some are just thrown
  updateStatus(status, "Retrieving video data...");
  try {
    await ytdl.getBasicInfo(removeExtraYTInfo(url)).then((info) => {
      const video = new Video(
        info.videoDetails.video_url,
        info.videoDetails.title
      );
      if (file_name.trim().length === 0) {
        file_name = video.title;
      }
      const saved_file = new AudioFile(store.get("savePath"), file_name);
      video.save(saved_file.path).then(() => {
        updateStatus(
          status,
          `"${path.basename(saved_file.path)}" saved successfully`,
          "#00c210"
        );
        saved_file.open();
      });
    });
  } catch (err) {
    console.error(err);
    let error_message = "Error: ";
    if (/ENOTFOUND/.test(err.message)) {
      error_message += "Invalid URL. Check your internet connection";
    } else {
      error_message += err.message;
    }
    updateStatus(status, error_message, "#e01400");
  }
};

downloadBtn.addEventListener("click", (event) => {
  let url = document.getElementById("url-box").value,
    file_name = document.getElementById("name-box").value;

  download(url, file_name);
});

[
  document.getElementById("url-box"),
  document.getElementById("name-box")
].forEach((item) => {
  item.addEventListener("keyup", (event) => {
    event.preventDefault();
    if (event.key == "Enter") {
      downloadBtn.click();
    }
  })
})
