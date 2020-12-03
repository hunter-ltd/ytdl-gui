// This follows the example found here: https://medium.com/cameron-nokes/how-to-store-user-data-in-electron-3ba6bf66bc1e
const electron = require("electron");
const path = require("path");
const fs = require("fs");
const { ipcRenderer } = require("electron");

class Store {
  constructor(options) {
    const getUserDataPath = async () => await ipcRenderer.invoke("getPath", "userData").then((result) => {
        this.path = path.join(result, options.configName + ".json");
        this.data = parseDataFile(this.path, options.defaults);
    });
    getUserDataPath()
  }

  get(key) {
    return this.data[key];
  }

  set(key, value) {
    this.data[key] = value;
    fs.writeFileSync(this.path, JSON.stringify(this.data));
  }
}

var parseDataFile = (filePath, defaults) => {
  try {
    return JSON.parse(fs.readFileSync(filePath));
  } catch (error) {
    return defaults;
  }
};

module.exports = Store;
