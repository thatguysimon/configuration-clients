"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yaml_1 = __importDefault(require("yaml"));
const fs_1 = __importDefault(require("fs"));
const OSVars_1 = require("./OSVars");
const OSVars_2 = __importDefault(require("./OSVars"));
const Secrets_1 = __importDefault(require("./Secrets"));
const EnvConfigLoaderFactory_1 = __importDefault(require("./EnvConfigLoaderFactory"));
const EnvConfig_1 = __importDefault(require("./EnvConfig"));
const EnvConfigContext_1 = __importDefault(require("./EnvConfigContext"));
function yamlTypeToTypescript(type) {
    const conversionMap = {
        String: OSVars_1.OSVarType.String,
        Int: OSVars_1.OSVarType.Int,
        Float: OSVars_1.OSVarType.Float,
        Bool: OSVars_1.OSVarType.Boolean,
    };
    return conversionMap[type];
}
class ConfigBuilder {
    constructor(context) {
        this.__context = context;
    }
    __buildOSVars(data) {
        if (data['env-vars']) {
            Object.keys(data['env-vars']).forEach(envVarName => {
                const envVarData = data['env-vars'][envVarName];
                if (envVarData.is_mandatory) {
                    OSVars_2.default.registerMandatory(envVarName, envVarData.description, yamlTypeToTypescript(envVarData.type));
                }
                else {
                    OSVars_2.default.register(envVarName, envVarData.description, yamlTypeToTypescript(envVarData.type), envVarData.default !== undefined ? envVarData.default.toString() : undefined);
                }
            });
        }
        OSVars_2.default.initialize();
    }
    async __buildSecrets(data) {
        if (data.secrets) {
            const secretsConf = data.secrets;
            if (secretsConf.required) {
                for (const [secretCategory, anySecretKey] of Object.entries(secretsConf.required)) { // eslint-disable-line
                    // all required / declared secrets must exists upon conf initialization
                    const secretKey = anySecretKey;
                    try {
                        await Secrets_1.default.instance.requireSecret(secretCategory, secretKey); // eslint-disable-line
                    }
                    catch (ex) {
                        console.log(`Failed fetching Secrets key ${secretKey}. Error: ${ex}`);
                        process.exit(1);
                    }
                }
            }
        }
    }
    async __buildConf(data) {
        if (data.config) {
            const confData = data.config;
            const confLoader = new EnvConfigLoaderFactory_1.default().getLoader(confData.provider);
            if (confData.parent_environments) {
                EnvConfig_1.default.instance.setEnvFallback(confData.parent_environments);
            }
            // injecting config loader (github, gitlab or whatever else)
            await EnvConfig_1.default.instance.setLoader(confLoader);
            // injecting context handler and context data
            EnvConfig_1.default.instance.setContextHandler(new EnvConfigContext_1.default(EnvConfig_1.default.env));
            if (this.__context) {
                Object.entries(this.__context).forEach(([k, v]) => {
                    EnvConfig_1.default.addContext(k, v);
                });
            }
            if (confData.categories) {
                for (const category of confData.categories) { // eslint-disable-line
                    await EnvConfig_1.default.instance.requireCategory(category.toLowerCase()); // eslint-disable-line
                }
            }
        }
    }
    async build(pathToYaml) {
        let path = pathToYaml || '';
        if (pathToYaml === '') {
            path = `${process.cwd()}/.envConfig.yml`;
        }
        console.log(`Attempting to read env config yaml from ${path}`);
        const fileData = fs_1.default.readFileSync(path, 'utf8');
        const data = yaml_1.default.parse(fileData);
        this.__buildOSVars(data);
        await this.__buildSecrets(data);
        await this.__buildConf(data);
        return true;
    }
}
exports.default = ConfigBuilder;
//# sourceMappingURL=ConfigBuilder.js.map