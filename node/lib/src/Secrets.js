"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const OSVars_1 = __importStar(require("./OSVars"));
// TODO: move to a common folder within the config clients monorepo
const VAULT_API_VERSION = 'v1';
const VAULT_URL_KEY = 'VAULT_URL';
const VAULT_DEFAULT_URL = 'https://vault.twistbioscience-staging.com';
const VAULT_USER_KEY = 'VAULT_USER';
const VAULT_PASS_KEY = 'VAULT_PASSWORD';
OSVars_1.default.registerMandatory(VAULT_USER_KEY, 'Vault secret management user name', OSVars_1.OSVarType.String);
OSVars_1.default.registerMandatory(VAULT_PASS_KEY, 'Vault secret management password', OSVars_1.OSVarType.String);
OSVars_1.default.register(VAULT_URL_KEY, 'Vault secret management server', OSVars_1.OSVarType.String, VAULT_DEFAULT_URL);
class Secrets {
    constructor() {
        const options = {
            apiVersion: VAULT_API_VERSION,
            endpoint: OSVars_1.default.get(VAULT_URL_KEY),
        };
        this.__vault = require('node-vault')(options); // eslint-disable-line
        this.__loggedIn = false;
        this.__secrets = {};
        this.__pathToSecrets = {};
    }
    static get instance() {
        if (!Secrets.__instance) {
            Secrets.__instance = new Secrets();
        }
        return Secrets.__instance;
    }
    async login() {
        if (this.__loggedIn) {
            return true;
        }
        try {
            const ret = await this.__vault.userpassLogin({
                username: OSVars_1.default.get(VAULT_USER_KEY),
                password: OSVars_1.default.get(VAULT_PASS_KEY),
            });
            this.__vault.token = ret.auth.client_token;
            console.log(`successfully connected to Vault on ${OSVars_1.default.get(VAULT_URL_KEY)}`);
            this.__loggedIn = true;
            return true;
        }
        catch (ex) {
            throw new Error(`failed login to Vault. Check your environment config file for vault user and password: ${ex}`);
        }
    }
    // ensuring secret exists + preload
    async requireSecret(secretCategory, pathToSecret) {
        const secret = await this.getByPath(pathToSecret);
        this.__secrets[secretCategory] = secret;
        return true;
    }
    // get a secret without specifying category - for non declarative purposes (it will be cached regardless)
    async getByPath(pathToSecret) {
        await this.login();
        if (this.__pathToSecrets[pathToSecret]) {
            return this.__pathToSecrets[pathToSecret];
        }
        try {
            console.log(`Fetching secret from ${pathToSecret}`);
            const secret = await this.__vault.read(pathToSecret);
            // using vault v2 the below is the new way to fetch a secret
            // secret = self.__client.secrets.kv.v2.read_secret_version(path)
            if (!secret || !('data' in secret)) {
                throw new Error(`Could not find [${pathToSecret}] in Vault!`);
            }
            this.__pathToSecrets[pathToSecret] = secret.data;
            return secret.data;
        }
        catch (ex) {
            throw new Error(`failed reading [${pathToSecret}] from Vault! Exception details: ${ex}`);
        }
    }
    static async get(secretCategory) {
        await Secrets.instance.login();
        return Secrets.instance.__get(secretCategory);
    }
    __get(secretCategory) {
        if (!(secretCategory in this.__secrets)) {
            throw new Error(`Unknown secret category [${secretCategory}`);
        }
        return this.__secrets[secretCategory];
    }
}
exports.default = Secrets;
//# sourceMappingURL=Secrets.js.map