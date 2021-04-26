/* eslint-disable @typescript-eslint/interface-name-prefix */
export default interface IEnvConfigLoader {
    // Performs the actual configuration reading (from whatever source concrete impl represents)
    // shall return JSON representation of data
    load(category: string): Promise<any>;

    // Fetches a list of actual configuration categories.
    listCategories(): Promise<Array<string>>;

    // set env is expected to validate environment existence and set it as active for rest of its operation
    setEnv(environment: string, fallback: Array<string>): Promise<boolean>;

    // set the configuration version
    setVersion(version: Number): void;

    // get the configuration version
    getVersion(): Number;
}
