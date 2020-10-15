#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");

const customConfigPath = path.resolve(__dirname, "../../", ".githooksrc");
const localCommitConfigPath = path.resolve(__dirname, "./commit-config.json");
let customConfig = {};
let localCommitConfig = {};
// reading custom config
if (fs.existsSync(customConfigPath)) {
    customConfig = JSON.parse(fs.readFileSync(customConfigPath, "utf8"));
}

if (fs.existsSync(localCommitConfigPath)) {
    localCommitConfig = JSON.parse(fs.readFileSync(localCommitConfigPath, "utf8"));
}

const config = Object.assign({}, localCommitConfig, customConfig.commit);

const PATTERN = new RegExp(config.msgRegex);
const FIXUP_SQUASH = new RegExp(config.fixupSquashRegex);
const REVERT = new RegExp(config.revertRegex);

module.exports = function (commitSubject) {
    // remove fixup and squash related content from the commit for validation
    const subject = commitSubject.replace(FIXUP_SQUASH, "");

    // bypass the commit check in case the current commit is specifically a revert commit.
    if (subject.match(REVERT)) {
        return true;
    }

    if (subject.length > config["maxLength"]) {
        error(`The commit message is longer than ${config["maxLength"]} characters`, commitSubject);
        return false;
    }

    const match = PATTERN.exec(subject);
    if (!match) {
        error(
            `The commit message does not match the format of '<type>[(<scope>)]: <subject>' OR 'Revert: "type[(<scope>)]: <subject>"'`,
            commitSubject
        );
        return false;
    }

    const type = match[1];
    if (config.types.indexOf(type) === -1) {
        error(`${type} is not an allowed type.\n => TYPES: ${config.types.join(", ")}`, commitSubject);
        return false;
    }

    const scope = match[2];
    if (!scope) {
        warn(`It's good to define a scope in a commit message`);
    }

    if (scope && config.scopes.length && !config.scopes.includes(scope)) {
        error(`"${scope}" is not an allowed scope.\n => SCOPES: ${config["scopes"].join(", ")}`, commitSubject);
        return false;
    }

    return true;
};

function error(errorMessage, commitMessage) {
    console.error(`INVALID COMMIT MSG: "${commitMessage}"\n => ERROR: ${errorMessage}`);
    console.error("\nRead about commit message format at ", config.doc);
}

function warn(warnMessage) {
    console.warn(`Please check: "${warnMessage}"\n`);
}
module.exports.config = config;
