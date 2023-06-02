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
pjson.channel = channel
if (channel === "quantum") {
    version = `${pjson.version}-quantum`;
    pjson.version = version
}
fs.writeFileSync('package.json', JSON.stringify(pjson, null, 4))

const releaseJson = {
    "channel": channel,
    "version": version,
    "updateServer": channel === "quantum" ? "https://quantum-releases.quarklight.tech" : "https://releases.quarklight.tech"
}

fs.writeFileSync('public/release.json', JSON.stringify(releaseJson, null, 2))