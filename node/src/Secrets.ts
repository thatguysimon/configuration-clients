import OSVars from './OSVars'
import { OSVarType } from './OSVars'

const VAULT_API_VERSION = 'v1';
const VAULT_URL_KEY = "VAULT_URL"
const VAULT_DEFAULT_URL = "https://vault.twistbioscience-staging.com"
const VAULT_USER_KEY = "VAULT_USER"
const VAULT_PASS_KEY = "VAULT_PASSWORD"


OSVars.registerMandatory(VAULT_USER_KEY, "Vault secret management user name", OSVarType.String)
OSVars.registerMandatory(VAULT_PASS_KEY, "Vault secret management password", OSVarType.String)

OSVars.register(VAULT_URL_KEY, "Vault secret management server", OSVarType.String, VAULT_DEFAULT_URL)

export default class Secrets {
  private static __instance: Secrets;
  private __loggedIn: boolean;
  private __secrets: any;
  private __vault: any;

  private constructor() {
    const options = {
      apiVersion: VAULT_API_VERSION,
      endpoint: OSVars.get(VAULT_URL_KEY),
    };

    this.__vault = require('node-vault')(options); // eslint-disable-line
    this.__loggedIn = false;
    this.__secrets = {};
  }

  public static get instance(): Secrets {
    if (!Secrets.__instance) {
      Secrets.__instance = new Secrets();
    }

    return Secrets.__instance;
  }

  async login(): Promise<boolean> {
    if (this.__loggedIn) {
      return true;
    }

    try {
      const ret = await this.__vault.userpassLogin({
        username: OSVars.get(VAULT_USER_KEY),
        password: OSVars.get(VAULT_PASS_KEY),
      });

      this.__vault.token = ret.auth.client_token;
      console.log(`successfully connected to Vault on ${OSVars.get(VAULT_URL_KEY)}`);
      this.__loggedIn = true;

      return true;
    } catch (ex) {
      throw new Error(`failed login to Vault. Check your environment config file for vault user and password: ${ex}`);
    }
  }

  public static async get(pathToSecret: string): Promise<any> {
    await Secrets.instance.login()
    return Secrets.instance.__get(pathToSecret)
  }

  private async __get(pathToSecret: string): Promise<any> {
    // try to hit cache first
    if (pathToSecret in this.__secrets) {
      return this.__secrets[pathToSecret]
    }

    try {

      const secret = await this.__vault.read(pathToSecret)
      // using vault v2 the below is the new way to fetch a secret
      // secret = self.__client.secrets.kv.v2.read_secret_version(path)

      if (!secret || !("data" in secret)) {
        throw new Error(`Could not find [${pathToSecret}] in Vault!`)
      }

      this.__secrets[pathToSecret] = secret["data"]
      return secret["data"]
    } catch (ex) {
      throw new Error(`failed reading [${pathToSecret}] from Vault! Exception details: ${ex}`)
    }
  }
}
