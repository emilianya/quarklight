require('dotenv').config();
const fs = require('fs');
const path = require('path');
let releaseJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'build/release.json')).toString())

module.exports = {
    "packagerConfig": {
        "asar": true,
        "icon": "build/logo"
    },
    "rebuildConfig": {},
    "makers": [
        {
            "name": "@electron-forge/maker-squirrel",
            "config": {
                "loadingGif": "build/spinner.gif",
                "setupIcon": "build/logo@1.25x.ico"
            }
        },
        {
            "name": "@electron-forge/maker-zip",
            "platforms": [
                "darwin"
            ]
        },
        {
            "name": "@electron-forge/maker-deb",
            "config": {
                "options": {
                    "icon": "build/logo@1.25x.png"
                }
            }
        }
    ],
    "publishers": [
        {
            name: "@electron-forge/publisher-electron-release-server",
            config: {
                baseUrl: "https://releases.quarklight.tech",
                username: "admin",
                password: process.env.RELEASE_PASSWORD,
                channel: releaseJson.channel
            }
        }
    ]
}