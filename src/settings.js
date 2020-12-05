const electron = require("electron").remote;
const fs = require("fs");
const Store = require("./config.js");

const store = new Store({
  configName: "user-settings",
  defaults: {
    savePath: electron.app.getPath("downloads"),
  },
});
const folderInput = document.getElementById("folder-box");
const old_dir = store.get("savePath");
folderInput.value = old_dir;

const chooseFolderBtn = document.getElementById("choose-folder-btn");
chooseFolderBtn.addEventListener("click", (event) => {
  electron.dialog.showOpenDialog({
      properties: ['openDirectory'],
    })
    .then((result) => {
      if (!result.canceled) {
        folderInput.value = result.filePaths[0]; // filePaths is an array
      }
    });
});

const saveBtn = document.getElementById("save-btn");
saveBtn.addEventListener("click", () => {
  let new_dir = folderInput.value;
  if (fs.existsSync(new_dir)) {
    store.set("savePath", new_dir);
    electron.getCurrentWindow().close();
  }
});
