const pjson = require('./package.json')
const fs = require('fs')

const refToChannel = {
    "prod": "stable",
    "dev": "quantum"
}

const channel = refToChannel[process.env.GITHUB_REF_NAME]
console.log("Github ref name: " + process.env.GITHUB_REF_NAME)
console.log("Publishing to channel: " + channel)
console.log("Version: " + pjson.version)


const releaseJson = {
    "channel": channel,
    "version": pjson.version,
    "updateServer": "https://releases.quarklight.tech"
}

fs.writeFileSync('public/release.json', JSON.stringify(releaseJson, null, 2))