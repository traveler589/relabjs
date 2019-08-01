#!/usr/bin/env node
const path = require("path");
const electron = require("electron");
const { spawn } = require("child_process");

const argv = process.argv.slice(2);

// 子進程
const child = spawn(electron, [path.resolve(__dirname, "../app.js"), ...argv], {
  // 配置在父进程和子进程之间建立的管道
  stdio: [process.stdin, "pipe", "pipe"]
});

child.stdout.pipe(process.stdout);

child.stderr.pipe(process.stderr);

child.on("close", code => {
  process.exit(code);
});
