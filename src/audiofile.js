const existsSync = require('fs').existsSync;
const join = require("path").join;
const shell = require("electron").shell;

/**
 * Removes characters deemed illegal for usage in file naming
 * @param {string} file_name The file path that needs to be checked
 * @returns {string} A legal string
 */
let removeIllegalChars = (file_name) => {
  const illegal = /[\\/:*?\"<>|]/g;
  if (illegal.test(file_name)) {
    let new_path = file_name.replace(illegal, "");
    return new_path;
  } else {
    return file_name;
  }
}

class AudioFile {
  constructor(save_path, file_name) {
    this.name = removeIllegalChars(file_name);
    if (!/.mp3/.test(file_name)) {
      this.name += ".mp3";
    }
    this.path = join(save_path, this.name);
  }

  /**
   * Opens and highlights the file in it's enclosing folder
   */
  open() {
    shell.showItemInFolder(this.path);
  }

  /**
   * Checks if the file exists yet
   */
  exists() {
    return existsSync(this.path);
  }
}

module.exports = AudioFile;
