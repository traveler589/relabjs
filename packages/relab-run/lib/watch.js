const chokidar = require("chokidar");
const EventEmitter = require("events");

const includes = ["**/*.{js,json}"];

const ignores = [
  "node_modules/**",
  "bower_components/**",
  ".git",
  ".hg",
  ".svn",
  ".DS_Store",
  ".vscode",
  "*.swp",
  "thumbs.db",
  "desktop.ini"
];

const fileWatch = (glob = includes, option) => {
  const opt = Object.assign(
    {
      ignored: ignores,
      ignoreInitial: true
    },
    option
  );

  if (opt.poll) {
    opt.usePolling = true;
  }

  let ready = false;
  let closed = false;
  const emitter = new EventEmitter();

  const watcher = chokidar.watch(glob, opt);

  watcher.on("change", file => {
    emitter.emit("change", file);
  });

  watcher.once("ready", () => {
    ready = true;

    if (closed) {
      watcher.close();
    }
  });

  emitter.close = () => {
    if (closed) {
      return;
    }

    if (ready) {
      watcher.close();
    }

    closed = true;
  };

  return emitter;
};

module.exports = fileWatch;
