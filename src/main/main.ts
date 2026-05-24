import { app, BrowserWindow } from "electron";
import { join } from "node:path";
import { createAppContext } from "./bootstrap/app-context.ts";
import { registerIpcHandlers } from "./ipc/register-ipc.ts";

const appContext = createAppContext();

const createMainWindow = (): BrowserWindow => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 760,
    minWidth: 960,
    minHeight: 640,
    show: false,
    webPreferences: {
      preload: join(app.getAppPath(), "src", "preload", "preload.ts"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  void mainWindow.loadFile(join(app.getAppPath(), "src", "renderer", "index.html"));

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