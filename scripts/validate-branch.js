#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");

const customConfigPath = path.resolve(__dirname, "../../", ".githooksrc");
const localBranchConfigPath = path.resolve(__dirname, "./branch-config.json");
let customConfig = {};
let localBranchConfig = {};
// reading custom config
if (fs.existsSync(customConfigPath)) {
    customConfig = JSON.parse(fs.readFileSync(customConfigPath));
}
if (fs.existsSync(localBranchConfigPath)) {
    localBranchConfig = JSON.parse(fs.readFileSync(localBranchConfigPath));
}

const config = Object.assign({}, localBranchConfig, customConfig.branch);

const PATTERN = new RegExp(config.branchRegex);
const BYPASS = new RegExp(config.bypassRegex);

module.exports = function (branchName) {
    const isBypass = branchName.match(BYPASS);

    if (isBypass) {
        return true;
    }

    if (branchName.length > config.maxLength) {
        error(`The branch name is longer than ${config["maxLength"]} characters`, branchName);
        return false;
    }

    const match = PATTERN.exec(branchName);
    if (!match) {
        error(`The branch name does not match the format of '<type>-<scope>-<meta>' OR 'hotfix-<meta>'`, branchName);
        return false;
    }

    const type = match[1];
    if (config["types"].indexOf(type) === -1) {
        error(`${type} is not an allowed type.\n => TYPES: ${config["types"].join(", ")}`, branchName);
        return false;
    }

    const scope = match[2];

    if (scope && !config["scopes"].includes(scope)) {
        error(`"${scope}" is not an allowed scope.\n => SCOPES: ${config["scopes"].join(", ")}`, branchName);
        return false;
    }

    return true;
};

function error(errorMessage, branchName) {
    console.error(`INVALID BRANCH NAME: "${branchName}"\n => ERROR: ${errorMessage}`);
}

module.exports.config = config;
