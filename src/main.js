const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 500,
    height: 550,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'GitHub Page',
          click() {
            shell.openExternal('https://github.com/oxapathic/ytdl-gui')
          }
        },
        { label: "About YTDL GUI", selector: "orderFrontStandardAboutPanel:" },
        { type: "separator" },
        {
          label: 'Save location',
          click() {
            var settingsWindow = new BrowserWindow({
              width: 500,
              height: 450,
              frame: true,
              webPreferences: {
                nodeIntegration: true,
                enableRemoteModule: true,
              }
            });
            // settingsWindow.openDevTools();
            settingsWindow.on('close', () => {
              settingsWindow = null;
            });
            settingsWindow.loadURL(path.join("file://", __dirname, 'settings.html'));
            settingsWindow.show()
          }
        },
        {type: 'separator'},
        {
          label: 'Quit',
          accelerator: "CmdOrCtrl+Q",
          click() {
            app.quit();
          }
        },
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
      ]
    }
  ]);

  Menu.setApplicationMenu(menu);

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
ipcMain.handle('getPath', async (event, path) => {
  const result = await app.getPath(path);
  return result;
});
