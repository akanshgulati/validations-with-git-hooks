const validateCommit = require('./validate-commit');
const validateBranch = require('./validate-branch');
const prepareCommit = require('./prepare-commit');

module.exports = {
    validateCommit,
    validateBranch,
    prepareCommit
};