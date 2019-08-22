const path = require("path");
const { app, ipcMain } = require("electron");
const { log, parse, createWatch, createWindow } = require("./lib");

process.removeAllListeners("uncaughtException");
process.stdin.pause();
// 去掉控制台默认提醒
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "1";
// 禁止请求 HTTP 时使用磁盘缓存
app.commandLine.appendSwitch("--disable-http-cache");

const argv = parse(process.cwd());

// 查看版本号
if (argv.version) {
  process.exit();
}

if (argv.error) {
  //   判斷文件是否存在
  log.error(argv.error);
  process.exit(1);
}

let watcher = null;
// 保持对window对象的全局引用，如果不这么做的话，当JavaScript对象被
// 垃圾回收的时候，window对象将会自动的关闭
let mainWindow = null;

const create = () => {
  // 创建浏览器窗口
  const url = path.join(__dirname, "lib/index.html");
  mainWindow = createWindow(url, argv.entry);

  // 当 window 被关闭，这个事件会被触发
  mainWindow.on("closed", () => {
    // 取消引用 window 对象，如果你的应用支持多窗口的话，
    // 通常会把多个 window 对象存放在一个数组里面，
    // 与此同时，你应该删除相应的元素。
    mainWindow = null;
  });

  if (!argv.entry) {
    return;
  }

  watcher = createWatch();

  watcher.on("change", () => {
    if (mainWindow) {
      mainWindow.reload();
    }
  });

  // error in renderer
  ipcMain.on("error", (_, err) => {
    log.clear();
    log.error(err);
  });

  ipcMain.on("run-done", () => {
    log.clear();
    log.success();
  });
};

// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。
app.on("ready", create);

/* app.on("activate", () => {
  // 在macOS上，当单击dock图标并且没有其他窗口打开时，
  // 通常在应用程序中重新创建一个窗口。
  if (!mainWindow) {
    create();
  }
}); */

// Quit
app.on("quit", () => {
  if (watcher) {
    watcher.close();
  }

  process.exit();
});

app.on("window-all-closed", () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== "darwin") {
    app.quit();
  }
});
