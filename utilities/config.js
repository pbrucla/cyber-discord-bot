// Config file handling
const fs = require("node:fs");

const CONFIG_FILE = __dirname + "/../config.json";
const DEFAULT_CONFIG = {
  xpost: {
    servers: {
      pbr: {
        label: "ACM Cyber & PBR",
        description: "UCLA's cybersecurity club and competitive CTF team!",
        id: process.env.GUILD_ID,
      },
    },
  },
};

let config;

try {
  config = JSON.parse(fs.readFileSync(CONFIG_FILE));
} catch (e) {
  if (e.code === "ENOENT") {
    console.log("Initializing config...");
    fs.writeFileSync(
      CONFIG_FILE,
      JSON.stringify(DEFAULT_CONFIG, null, 4) + "\n"
    );
    config = DEFAULT_CONFIG;
  } else if (e instanceof SyntaxError) {
    const ERROR_MSG = "The config file has syntax errors, exiting!";
    const SEPARATOR = "=".repeat(ERROR_MSG.length);
    console.error(`${SEPARATOR}\n${ERROR_MSG}\n${SEPARATOR}\n`);
    throw e;
  } else {
    throw e;
  }
}

module.exports = config;
