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
                "iconUrl": 'https://quarklight.tech/logo@2.5x.ico',
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
            "name": "@electron-forge/maker-dmg",
            "config": {
                "background": 'build/logo@5x.png',
                "format": 'ULFO'
            }
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
        /*{
            name: "@electron-forge/publisher-electron-release-server",
            config: {
                baseUrl: "https://releases.quarklight.tech",
                username: "admin",
                password: process.env.RELEASE_PASSWORD,
                channel: releaseJson.channel
            }
        }*/
        {
            name: '@electron-forge/publisher-github',
            config: {
                repository: {
                    owner: 'vtheskeleton',
                    name: 'quarklight'
                },
                draft: false,
                prerelease: releaseJson.channel === "quantum"
            }
        }
    ]
}