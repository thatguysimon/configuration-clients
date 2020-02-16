import YAML from 'yaml';

import fs from 'fs';
import { OSVarType, OSVars } from './OSVars';
import Secrets from './Secrets';
import EnvConfigLoaderFactory from './EnvConfigLoaderFactory';
import EnvConfig from './EnvConfig';

function yamlTypeToTypescript(type: string): OSVarType {
    const conversionMap: any = {
        String: OSVarType.String,
        Int: OSVarType.Int,
        Float: OSVarType.Float,
        Bool: OSVarType.Boolean,
    };

    return conversionMap[type];
}

export default class ConfigBuilder {
    private __buildOSVars(data: any): void {
        if (data['env-vars']) {
            Object.keys(data['env-vars']).forEach(envVarName => {
                const envVarData: any = data['env-vars'][envVarName];
                if (envVarData.is_mandatory) {
                    OSVars.registerMandatory(envVarName, envVarData.description, yamlTypeToTypescript(envVarData.type));
                } else {
                    OSVars.register(
                        envVarName,
                        envVarData.description,
                        yamlTypeToTypescript(envVarData.type),
                        envVarData.default.toString(),
                    );
                }
            });
        }
        OSVars.initialize();
    }

    private async __buildSecrets(data: any): Promise<void> {
        if (data.secrets) {
            const secretsConf = data.secrets;

            if (secretsConf.required) {
                for (const secretKey of secretsConf.required) { // eslint-disable-line
                    // all required / declared secrets must exists upon conf initialization
                    try {
                        await Secrets.get(secretKey); // eslint-disable-line
                    } catch (ex) {
                        throw new Error(`Failed fetching Secrets key ${secretKey}. Error: ${ex}`);
                    }
                }
            }
        }
    }

    private async __buildConf(data: any): Promise<void> {
        if (data.config) {
            const confData = data.config;

            const confLoader = new EnvConfigLoaderFactory().getLoader(confData.provider);

            if (confData.parent_environments) {
                EnvConfig.instance.setEnvFallback(confData.parent_environments);
            }

            await EnvConfig.instance.setLoader(confLoader);

            if (confData.categories) {
                for (const category of confData.categories) { // eslint-disable-line
                    await EnvConfig.instance.requireCategory(category.toLowerCase()); // eslint-disable-line
                }
            }
        }
    }

    public async build(pathToYaml?: string): Promise<boolean> {
        let path: string = pathToYaml ? pathToYaml : '';
        if (pathToYaml === '') {
            path = `${process.cwd()}/.envConfig.yml`;
        }

        console.log(`Attempting to read env config yaml from ${path}`);
        const fileData = fs.readFileSync(path, 'utf8');
        const data = YAML.parse(fileData);

        this.__buildOSVars(data);
        await this.__buildSecrets(data);
        await this.__buildConf(data);
        return true;
    }
}
