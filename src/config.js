// This follows the example found here: https://medium.com/cameron-nokes/how-to-store-user-data-in-electron-3ba6bf66bc1e
const electron = require("electron");
const path = require("path");
const fs = require("fs");

/**
 * Used to store user settings in JSON format
 */
class Store {
  constructor(options) {
    const userDataPath = (electron.app || electron.remote.app).getPath('userData');
    this.path = path.join(userDataPath, 'user-settings.json')

    this.data = parseDataFile(this.path, options.defaults);
  }

  get(key) {
    return this.data[key];
  }

  set(key, value) {
    this.data[key] = value;
    fs.writeFileSync(this.path, JSON.stringify(this.data));
  }
}

/**
 * 
 * @param {string} filePath Path to the JSON settings file
 * @param {dict} defaults Default settings to be used if the settings file cannot be found (or does not exist)
 */
var parseDataFile = (filePath, defaults) => {
  try {
    return JSON.parse(fs.readFileSync(filePath));
  } catch (error) {
    data = {};
    console.log(defaults);
    for (const key in defaults) {
      if (defaults.hasOwnProperty(key)) {
        const option = defaults[key];
        console.log(key)
        data[key] = option;
      }
    }
    console.log(data)
    fs.writeFileSync(filePath, JSON.stringify(data));
    return data;
  }
};

module.exports = Store;
