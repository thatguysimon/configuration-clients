"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRODUCTION_BRANCH_NAME = 'master';
exports.ENV_VAR_NAME = 'TWIST_ENV';
function isProduction() {
    return process.env[exports.ENV_VAR_NAME] === exports.PRODUCTION_BRANCH_NAME;
}
exports.default = isProduction;
//# sourceMappingURL=Common.js.map