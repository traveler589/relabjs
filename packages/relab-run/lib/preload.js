const { ipcRenderer } = require("electron");

/* 
window.addEventListener("unhandledrejection", function(e) {
  // 阻止控制台輸出 Uncaught (in promise)
  e.preventDefault();
  console.error("撿漏：不要輕易忽略任何一個錯誤 =>", e.reason);
});

process.on("uncaughtException", err => {
  console.log("uncaughtException ->>>", err);
});

process.on("unhandledRejection", reason => {
  console.log("unhandledRejection =>");
  console.log(reason);
}); */

ipcRenderer.on("run-entry", (_, entry) => {
  if (entry) {
    require(entry);
    ipcRenderer.send("run-done");
  }
});

window.onerror = (...args) => {
  const err = new Error(args.pop());

  ipcRenderer.send("error", err.message);
  // 返回true，阻止执行默认事件处理函数
  // return true;
};
