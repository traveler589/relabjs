const path = require("path");
const { BrowserWindow } = require("electron");
const log = require("./log");

module.exports = (url, entry) => {
  const webPreferences = {
    // 禁用同源策略
    webSecurity: false,
    // 集成Node
    nodeIntegration: true
  };

  if (entry) {
    webPreferences.preload = path.join(__dirname, "preload.js");
  }

  // 创建浏览器窗口
  const mainWindow = new BrowserWindow({
    show: false,
    useContentSize: true,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    webPreferences
  });

  const { webContents } = mainWindow;

  // 加载index.html文件
  mainWindow.loadFile(url);

  // 打开开发者工具
  webContents.openDevTools({ mode: "detach" });

  webContents.on("dom-ready", () => {
    if (entry) {
      log.info();
      webContents.send("run-entry", entry);
    }
  });

  // 关闭开发者工具
  webContents.once("devtools-closed", () => {
    setTimeout(() => mainWindow.close(), 50);
  });

  return mainWindow;
};
