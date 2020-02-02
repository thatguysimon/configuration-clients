import IEnvConfigLoader from '../src/IEnvConfigLoader'

export default class MockConfigLoader implements IEnvConfigLoader {

  private categories: Array<string> = [];
  private data: any;

  public async load(category: string): Promise<any> {
    try {
      return this.data[category.toUpperCase()];
    } catch (ex) {
      return {}
    }
  }

  public async listCategories(): Promise<Array<string>> {
    return this.categories;
  }

  public mockSetCategories(categories: Array<string>) {
    this.categories = categories;
  }

  public mockSetData(data: any) {
    this.data = data;
  }
}