const pjson = require('./package.json')
const fs = require('fs')

const refToChannel = {
    "prod": "stable",
    "dev": "quantum"
}

const channel = refToChannel[process.argv[2]]
console.log("Publishing to channel: " + channel)
console.log("Version: " + pjson.version)


const releaseJson = {
    "channel": channel,
    "version": pjson.version,
    "updateServer": "https://releases.quarklight.tech"
}

fs.writeFileSync('public/release.json', JSON.stringify(releaseJson, null, 2))