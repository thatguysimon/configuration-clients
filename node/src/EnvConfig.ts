import * as env from 'env-var';
import EnvConfigLoaderFactory from './EnvConfigLoaderFactory'
import IEnvConfigLoader from './IEnvConfigLoader'

/* eslint-disable @typescript-eslint/no-explicit-any */

// TODO: the below should be common to this monorepo (share with with python, ruby etc.)
const TWIST_ENV_KEY = 'TWIST_ENV';

export default class EnvConfig {
  private static __theInstance: EnvConfig;

  public static readonly TWIST_ENV_KEY: string = TWIST_ENV_KEY;

  private env: string;

  private configJSON: any;
  // @injectable
  private configLoader: IEnvConfigLoader | undefined;
  private configCategories: Set<string>;

  public static get instance(): EnvConfig {
    if (!EnvConfig.__theInstance) {
      EnvConfig.__theInstance = new EnvConfig();
    }

    return EnvConfig.__theInstance;
  }

  private constructor() {
    // This is a private ctor.
    // - Preventing multi instantiation
    // - initializing member variables with defaults

    this.env = env
      .get(TWIST_ENV_KEY)
      .required()
      .asString();
    this.configJSON = {};
    this.configLoader = undefined;
    // the below is a helper to hold collection of listed (not surely yet loaded) categories.
    this.configCategories = new Set<string>();
  }

  /**
   * @description Dependency injection of a config loader that adheres to the IEnvConfigLoader interface
   * @param configLoader - the injected object
   */
  public async setLoader(configLoader?: IEnvConfigLoader): Promise<void> {

    if (!configLoader) {
      this.configLoader = new EnvConfigLoaderFactory().getLoader(this.env);
    } else {
      this.configLoader = configLoader;
    }

    await this.loadCategories();
  }

  /**
   * 
   * @param category 
   */
  private listConfigurationCategory(category: string): void {
    this.configCategories.add(category);
    console.log(`EnvConfig category ${category} listed`)
  }

  /**
   * 
   */
  private async loadCategories(): Promise<void> {
    if (!this.configLoader) {
      throw new Error("config loader has not been set")
    }

    const categories = await this.configLoader.listCategories();

    for (const category of categories) {
      const normalizedCategoryName = category.replace('.json', '').toUpperCase();
      this.listConfigurationCategory(normalizedCategoryName)
    }
  }


  public static async get(category: string, section?: string, key?: string, defaultValue?: any): Promise<any> {
    return EnvConfig.instance.__get(category, section, key, defaultValue);
  }

  /**
   * 
   * @param category 
   */
  private async loadConfig(category: string): Promise<any> {
    if (!this.configLoader) {
      throw new Error(
        "Cannot load config without a loader (implementing EnvConfigLoader). please call set_loader respectively"
      )
    }

    try {
      return this.configLoader.load(category);
    } catch (ex) {
      console.log(`Failed loading config for provided environment ${this.env}. Exception: ${ex}`);
    }
  }

  /**
   * 
   * @param category 
   * @param section 
   * @param key 
   * @param defaultValue 
   */
  private async __get(category: string, section?: string, key?: string, defaultValue?: any): Promise<any> {
    // detecting the first access ever to this instance,
    // it requires that we set a loader and initialize current environment configuration section (json files)
    if (!this.configLoader) {
      await this.setLoader();
    }

    // category is being accessed for the first time, load it
    if (this.configJSON[category] === undefined) {
      this.configJSON[category] = await this.loadConfig(category);
    }

    // someone wants to get a hold of the entire category config
    if (!section) {
      return this.configJSON[category];
    }

    // someone wants to get a hold of an entire section structure
    if (this.configJSON[category] !== undefined && key === undefined) {
      return this.configJSON[category][section];
    }

    // missing section
    if (this.configJSON[category][section] === undefined) {
      return defaultValue;
    }

    // missing key in section
    if (key != undefined && this.configJSON[category][section][key] === undefined) {
      return defaultValue;
    }

    // actual config indicated data
    if (key != undefined) {
      return this.configJSON[category][section][key];
    }
  }
}


