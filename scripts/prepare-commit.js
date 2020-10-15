const fs = require("fs");
const path = require("path");
const customConfigPath = path.resolve(__dirname, "../../", ".githooksrc");
const localBranchConfigPath = path.resolve(__dirname, "./branch-config.json");
const localCommitConfigPath = path.resolve(__dirname, "./commit-config.json");
let customConfig = {};
let localBranchConfig = {};
let localCommitConfig = {};
// reading custom config
if (fs.existsSync(customConfigPath)) {
    customConfig = JSON.parse(fs.readFileSync(customConfigPath));
}
if (fs.existsSync(localBranchConfigPath)) {
    localBranchConfig = JSON.parse(fs.readFileSync(localBranchConfigPath));
}
if (fs.existsSync(localCommitConfigPath)) {
    localCommitConfig = JSON.parse(fs.readFileSync(localCommitConfigPath));
}

const branchConfig = Object.assign({}, localBranchConfigPath, customConfig.branch);
const commitConfig = Object.assign({}, localCommitConfig, customConfig.commit);
const ISSUE_PATTERN = new RegExp(branchConfig.issueRegex);

module.exports = async function prepareCommit(commitFilePath, headFilePath) {
    // const branch = await _exec("git symbolic-ref --short HEAD");
    if (!commitConfig.isAppendJiraIdEnabled) {
        return true;
    }
    const headRef = fs.readFileSync(headFilePath, { encoding: "utf-8" });
    const commitMessage = fs.readFileSync(commitFilePath, { encoding: "utf-8" });
    const branch = headRef.split("/")[2].trim();
    const isBranchHasIssueId = !!branch.match(ISSUE_PATTERN);
    if (!isBranchHasIssueId) {
        return true;
    }

    const issueId = branch.match(ISSUE_PATTERN)[1];
    const isCommitHasIssueId = !!commitMessage.match(ISSUE_PATTERN);

    if (!isCommitHasIssueId) {
        const currentType = commitMessage.match(/^(\w+)/)[0];
        const updatedCommit = currentType + "-" + issueId + commitMessage.replace(currentType, "");
        fs.writeFileSync(commitFilePath, updatedCommit, { encoding: "utf-8" });
        return true;
    }
    return true;
};
