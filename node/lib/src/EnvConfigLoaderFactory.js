"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GithubEnvConfigLoader_1 = __importDefault(require("./GithubEnvConfigLoader"));
/**
 * Config loader factory.
 * Should one decide working with config that is different than github, a proper concrete impl should be provided,
 * the getLoader method should return an instance to the alternative loader (maybe gitlab or something else)
 * In case this library will provide multiple options, the instantiation should be made dynamically from config (env, arg)
 */
class EnvConfigLoaderFactory {
    getLoader(name = 'default') {
        const loadersMap = {
            github: GithubEnvConfigLoader_1.default,
            default: GithubEnvConfigLoader_1.default,
        };
        const loader = loadersMap[name];
        return new loader(); // eslint-disable-line
    }
}
exports.default = EnvConfigLoaderFactory;
//# sourceMappingURL=EnvConfigLoaderFactory.js.map