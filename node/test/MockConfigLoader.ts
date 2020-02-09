import IEnvConfigLoader from '../src/IEnvConfigLoader';

export default class MockConfigLoader implements IEnvConfigLoader {
    private __categories: Array<string> = [];

    private __data: any;

    private __env: string;

    private __fallback: Array<string>;

    constructor() {
        this.__env = '';
        this.__fallback = [];
    }

    public async setEnv(env: string, fallback: Array<string>): Promise<boolean> {
        this.__env = env;
        this.__fallback = fallback;
        console.log(`env is ${this.__env} and fb: ${this.__fallback}`);
        return true;
    }

    public async load(category: string): Promise<any> {
        try {
            return this.__data[category.toUpperCase()];
        } catch (ex) {
            return {};
        }
    }

    public async listCategories(): Promise<Array<string>> {
        return this.__categories;
    }

    public mockSetCategories(categories: Array<string>) {
        this.__categories = categories;
    }

    public mockSetData(data: any) {
        this.__data = data;
    }
}
