const path = require("path");

module.exports = cwd => {
  const config = {};
  const argv = process.argv.slice(2);
  const command = argv[0];

  if (argv.length !== 1 || !command) {
    return config;
  }

  const { name, version } = require("../package.json");

  // 查看node/chrome/electron版本号
  if (command === "-V") {
    const { node, chrome, electron } = process.versions;
    const coll = [name, "node", "chrome", "electron"];

    coll.sort((a, b) => b.length - a.length);

    const size = coll[0].length;

    console.log(name.padEnd(size, " "), version);
    console.log("node".padEnd(size, " "), node);
    console.log("chrome".padEnd(size, " "), chrome);
    console.log("electron".padEnd(size, " "), electron);

    config.version = true;
  }
  // 查看当前项目版本号
  else if (command === "-v") {
    console.log(`${name} ${version}`);
    config.version = true;
  }
  // 其他情况视为入口文件
  else {
    config.entry = path.isAbsolute(command)
      ? command
      : path.resolve(cwd, command);

    try {
      require.resolve(config.entry);
    } catch (e) {
      config.error = e.message || `Cannot find module '${config.entry}'`;
    }
  }

  return config;
};
