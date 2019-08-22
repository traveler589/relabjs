module.exports = {
  info() {
    console.log("Compile is starting...");
  },
  success() {
    const time = new Date().toTimeString().substr(0, 8);
    console.log("DONE:", `Compiled successfully on ${time}`);
  },
  error(err) {
    console.log("ERROR:", "Failed to compile with error");
    console.error(err);
  },
  clear() {
    // process.stdout.write("\033c");
    process.stdout.write(
      process.platform === "win32" ? "\x1B[2J\x1B[0f" : "\x1B[2J\x1B[3J\x1B[H"
    );
  }
};
