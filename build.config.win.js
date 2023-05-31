let config = require("./build.config")

config.extraResources = {
    "from": "./resource/adb_win32",
    "to": "adb"
}

module.exports = config;