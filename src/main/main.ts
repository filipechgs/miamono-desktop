import { app, BrowserWindow } from "electron";
import { join } from "node:path";
import { createAppContext } from "./bootstrap/app-context.ts";
import { registerIpcHandlers } from "./ipc/register-ipc.ts";

const appContext = createAppContext();

const resolveIconPath = (): string => {
  const iconFileName = process.platform === "win32" ? "miamono-mascote.ico" : "miamono-mascote.png";

  return app.isPackaged
    ? join(process.resourcesPath, "doc", iconFileName)
    : join(app.getAppPath(), "doc", iconFileName);
};

const appIconPath = resolveIconPath();

const createMainWindow = (): BrowserWindow => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 760,
    minWidth: 960,
    minHeight: 640,
    show: false,
    icon: appIconPath,
    webPreferences: {
      preload: join(app.getAppPath(), "dist", "preload", "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();

    if (!app.isPackaged) {
      mainWindow.webContents.openDevTools();
    }
  });

  void mainWindow.loadFile(join(app.getAppPath(), "dist", "renderer", "index.html"));

  return mainWindow;
};

app.whenReady().then(() => {
  registerIpcHandlers(appContext);
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  appContext.database.close();
});