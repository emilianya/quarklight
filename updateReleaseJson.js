const pjson = require('./package.json')
const fs = require('fs')

const refToChannel = {
    "prod": "stable",
    "dev": "quantum"
}

const channel = refToChannel[process.argv[2]]
console.log("Publishing to channel: " + channel)
console.log("Version: " + pjson.version)

let version = pjson.version
if (channel === "stable") {
    version = `${pjson.version}-release`;
    pjson.version = version
    fs.writeFileSync('package.json', JSON.stringify(pjson, null, 4))
}

const releaseJson = {
    "channel": channel,
    "version": version,
    "updateServer": "https://releases.quarklight.tech"
}

fs.writeFileSync('public/release.json', JSON.stringify(releaseJson, null, 2))