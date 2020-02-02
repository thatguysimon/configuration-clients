/* eslint-disable @typescript-eslint/interface-name-prefix */
export default interface IEnvConfigLoader {
    // Performs the actual configuration reading (from whatever source concrete impl represents)
    // shall return JSON representation of data
    load(category: string): Promise<any>;

    // Fetches a list of actual configuration categories.
    listCategories(): Promise<Array<string>>;
}
