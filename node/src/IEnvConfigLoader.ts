export default interface IEnvConfigLoader {
  // Performs the actual configuration reading (from whatever source concrete impl represents)
  load(category: string): Promise<any>;

  listCategories(): Promise<Array<string>>;
}