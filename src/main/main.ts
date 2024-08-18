/* eslint-disable no-console */
/* eslint-disable global-require */
import path from 'path';
import { app, BrowserWindow, shell, screen, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';

import { version } from '../../package.json';

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const checkForUpdates = async (): Promise<boolean> => {
  try {
    const result = await autoUpdater.checkForUpdates();
    const updateAvailable = result && result.updateInfo?.version !== version;
    const updateDownloaded = result && result.downloadPromise !== undefined;
    return !!(updateAvailable && !updateDownloaded);
  } catch (erro: any) {
    console.error('Error checking for updates:', erro);
    return false;
  }
};

const createWindow = async (updateAvailable: boolean) => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(app.getAppPath(), 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    show: false,
    width,
    height,
    icon: getAssetPath('icon.png'),
    title: 'YouTube Music Desktop',
    autoHideMenuBar: true,
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.ym/dll/preload.js'),
    },
  });

  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    mainWindow.setTitle('YouTube Music Desktop');
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('close', async (event) => {
    event.preventDefault();

    const response = await dialog.showMessageBox(mainWindow as any, {
      type: 'warning',
      buttons: ['Yes', 'No'],
      title: 'Close Warning',
      message:
        'Do you really want to close the Youtube Music Desktop (YDM) application?',
    });

    if (response.response === 0) {
      app.exit();
    }
  });

  mainWindow.loadURL('https://music.youtube.com');

  mainWindow.setMenu(null);

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.setWindowOpenHandler((edata: any) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  if (updateAvailable) {
    const response = await dialog.showMessageBox(mainWindow, {
      type: 'info',
      buttons: ['Update now', 'Later', 'Close'],
      title: 'Update Available',
      message: 'An update is available. Would you like to update now?',
    });

    if (response.response === 0) {
      autoUpdater.quitAndInstall();
    } else if (response.response === 2) {
      app.quit();
    }
  }
};

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  // eslint-disable-next-line promise/always-return
  .then(async () => {
    const updateAvailable = await checkForUpdates();
    await createWindow(updateAvailable);
    app.on('activate', () => {
      if (mainWindow === null) createWindow(false);
    });
  })
  .catch((err: Error) => {
    console.error('Error creating window:', err);
  });
