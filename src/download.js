const ytdl = require("ytdl-core");
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const Store = require("./config.js");
const electron = require('electron');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');

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


var saveFile = (url, file_path) => {
  return new Promise(async (resolve, reject) => {
    var stream = ytdl(url, { filter: "audioonly" });
    ffmpeg(stream).save(file_path);

    stream.on('error', (err) => {
      reject(err);
    });

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
      console.log(`'${file_path}' saved successfully`);
      break;
    }
    resolve(file_path);

  })
}


const parseTitle = (body) => {
  let match = body.match(/<title>([^<]*)<\/title>/);
  return match[1];
}


var urlExists = async (url) => {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then(res => res.text())
      .then(body => resolve(parseTitle(body)))
      .catch((err) => reject(err));
  });
}


var download = async () => {
  const store = new Store({
    configName: "user-settings",
    defaults: {
        savePath: electron.remote.app.getPath("downloads"),
      },
  });

  let status = document.getElementById('status'),
      url = document.getElementById("url-box").value,
      file_name = document.getElementById("name-box").value,
      exists = await urlExists(url).then((title) => {
        if (file_name.trim().length != 0) {
          file_name = removeIllegalChars(file_name);
        } else {
          file_name = title.replace(" - YouTube", "");
        }
        status.innerHTML = '';
        status.style.color = 'gray';
        return true;
      }).catch((err) => {
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
  status.style.color = 'gray';

  saveFile(url, file_path).then((save_path) => {
    status.innerHTML = `<i>${save_path} successfully saved</i>;`
    status.style.color = "#00c210";
    electron.shell.showItemInFolder(file_path); // Opens the folder and highlights the file
  }).catch((error) => {
    status.innerHTML = "<i>Error: </i>";
    status.style.color = "#e01400";
    console.error(error);
    if (!(error instanceof TypeError)) {
      status.innerHTML += error.message;
    }
  });
};

downloadBtn.addEventListener("click", (event) => {
  download(document.getElementById('url-box').value);
});

[document.getElementById('url-box'), document.getElementById('name-box')].forEach(input => {
  input.addEventListener('keyup', event => {
    if (event.key == "Enter") {
      event.preventDefault();
      downloadBtn.click();
    }
  })
});
