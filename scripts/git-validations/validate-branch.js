#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const configPath = path.resolve(__dirname, './branch-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
// fix-ixi-1133
const PATTERN = /^(\w+)(?:-([^)]+)-)(.+)$/;
const HOTFIX = /^(hotfix)/i;

module.exports = function (branchName) {
    const isHotFix = branchName.match(HOTFIX);

    if (isHotFix) {
        return true;
    }

    if (branchName.length > config.maxLength) {
        error(`The branch name is longer than ${config['maxLength']} characters`, branchName);
        return false;
    }

    const match = PATTERN.exec(branchName);
    if (!match) {
        error(
            `The branch name does not match the format of '<type>-<scope>-<meta>' OR 'hotfix-<meta>'`,
            branchName);
        return false;
    }

    const type = match[1];
    if (config['types'].indexOf(type) === -1) {
        error(
            `${type} is not an allowed type.\n => TYPES: ${config['types'].join(', ')}`, branchName);
        return false;
    }

    const scope = match[2];

    if (scope && !config['scopes'].includes(scope)) {
        error(
            `"${scope}" is not an allowed scope.\n => SCOPES: ${config['scopes'].join(', ')}`,
            branchName);
        return false;
    }

    return true;
};

function error(errorMessage, branchName) {
    console.error(`INVALID BRANCH NAME: "${branchName}"\n => ERROR: ${errorMessage}`);
}

module.exports.config = config;