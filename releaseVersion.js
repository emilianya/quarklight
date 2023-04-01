// The purpose of this script is to update the version number in the capabilites.json file after npm version is run.
// And then commit the changes to git.

const newVersion = process.env.npm_new_version;

console.log("New version: " + newVersion)

const fs = require('fs');

const capabilities = require('./capabilities.json');
capabilities.client.version = newVersion; // Update the version number in the capabilities.json file

fs.writeFileSync('capabilities.json', JSON.stringify(capabilities, null, 4)); // Write the updated capabilities.json file

// Commit the changes to git
const { execSync } = require('child_process');
execSync('git add capabilities.json');
execSync(`git commit -m "Update version number in capabilities.json to ${newVersion}"`);

