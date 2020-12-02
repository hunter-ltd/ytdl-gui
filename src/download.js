const ytdl = require("ytdl-core");
// const exec = require("child_process").exec; // Used to execute shell commands
const ffmpeg = require("fluent-ffmpeg");

let removeIllegalChars = (filepath) => {
  const illegal = /[\\/:*?\"<>|]/g;
  if (illegal.test(filepath)) {
    let new_path = filepath.replace(illegal, "");
    return new_path;
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
  let url = document.getElementById("link-box").value;
  url = removeExtraURLInfo(url);
  try {
    var stream = ytdl(url, { filter: "audioonly" });
    ffmpeg(stream).save("C:\\Users\\gener\\Downloads\\test.mp3");
    document
      .getElementsByClassName("downloader")[0]
      .removeChild(document.getElementById("error-out"));
  } catch (error) {
    // handle TypeError for when the error box doesn't exist
    if (!(error instanceof TypeError)) {
      console.error(error);
      createErrorElement(error);
    }
  }
};

document.getElementById("download-btn").addEventListener("click", (event) => {
  download();
});

document.getElementById('link-box').addEventListener('keyup', (event) => {
    if (event.key == "Enter") {
        event.preventDefault();
        document.getElementById('download-btn').click();
    }
});
