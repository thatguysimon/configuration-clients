import EnvConfig from '../src/EnvConfig';
import MockConfigLoader from './MockConfigLoader';

const GLOBAL_CATEGORY = 'GLOBAL';
const GENE_CATEGORY = 'GENE';
// const MANY_CATEGORIES = [GLOBAL_CATEGORY, GENE_CATEGORY]

const SECTION_NAME = 'section';
const NON_EXISTING_SECTION_NAME = 'non-existing-section';
const NON_EXISTING_KEY_NAME = 'non-existing-key';
const GLOBAL_KEY_NAME_A = 'globalKeyA';
const GLOBAL_KEY_VALUE_A = 1;
const GENE_KEY_NAME_A = 'geneKeyA';
const GENE_KEY_VALUE_A = 1;
const DEFAULT_VALUE = 'default-val';

const MOCK_DATA = {
    [GLOBAL_CATEGORY]: { [SECTION_NAME]: { [GLOBAL_KEY_NAME_A]: GLOBAL_KEY_VALUE_A } },
    [GENE_CATEGORY]: { [SECTION_NAME]: { [GENE_KEY_NAME_A]: GENE_KEY_VALUE_A } },
};

describe('Test EnvConfig Traits', (): void => {
    let configLoader: MockConfigLoader;

    beforeEach(async () => {
        configLoader = new MockConfigLoader();
        process.env[EnvConfig.TWIST_ENV_KEY] = 'dummyEnv';
        await configLoader.setEnv('dummy', []);
    });

    async function mockConfig(categories: Array<string>, data: any) {
        configLoader.mockSetCategories(categories);
        configLoader.mockSetData(data);
        await EnvConfig.instance.setLoader(configLoader);
    }

    test('test that EnvConfig is a singleton', async (): Promise<void> => {
        expect(EnvConfig.instance).toBeInstanceOf(EnvConfig);
    });

    test('test that none existing section returns default', async (): Promise<void> => {
        await mockConfig([GLOBAL_CATEGORY], MOCK_DATA);

        const expected = DEFAULT_VALUE;
        const actual = await EnvConfig.get(GLOBAL_CATEGORY, NON_EXISTING_SECTION_NAME, NON_EXISTING_KEY_NAME, expected);

        expect(actual).toEqual(expected);
    });

    test('test that none existing key returns default', async (): Promise<void> => {
        await mockConfig([GLOBAL_CATEGORY], MOCK_DATA);

        const expected = DEFAULT_VALUE;
        const actual = await EnvConfig.get(GLOBAL_CATEGORY, SECTION_NAME, NON_EXISTING_KEY_NAME, expected);

        expect(actual).toEqual(expected);
    });

    test('test that none existing category throws exception', async (): Promise<void> => {
        await mockConfig([GLOBAL_CATEGORY], MOCK_DATA);

        const expected = undefined;
        let actual;
        try {
            await EnvConfig.get('DUMMY', SECTION_NAME, NON_EXISTING_KEY_NAME, expected);
        } catch (ex) {
            actual = ex;
        }

        expect(actual).toBeInstanceOf(Error);
    });

    test('test that existing key to return actual value', async (): Promise<void> => {
        await mockConfig([GLOBAL_CATEGORY], MOCK_DATA);

        const expected = GENE_KEY_VALUE_A;
        const actual = await EnvConfig.get(GENE_CATEGORY, SECTION_NAME, GENE_KEY_NAME_A);

        expect(actual).toEqual(expected);
    });

    test('test that existing key to return actual value even when default provided', async (): Promise<void> => {
        await mockConfig([GLOBAL_CATEGORY], MOCK_DATA);

        const expected = GENE_KEY_VALUE_A;
        const actual = await EnvConfig.get(GENE_CATEGORY, SECTION_NAME, GENE_KEY_NAME_A, DEFAULT_VALUE);

        expect(actual).toEqual(expected);
    });

    test('test get none existing key and section to return whole section', async (): Promise<void> => {
        await mockConfig([GLOBAL_CATEGORY], MOCK_DATA);

        const expected = { [GENE_KEY_NAME_A]: GENE_KEY_VALUE_A };
        const actual = await EnvConfig.get(GENE_CATEGORY, SECTION_NAME);

        expect(actual).toEqual(expected);
    });

    test('test get only category expected to return whole category config', async (): Promise<void> => {
        await mockConfig([GLOBAL_CATEGORY], MOCK_DATA);

        const expected = { [SECTION_NAME]: { [GENE_KEY_NAME_A]: GENE_KEY_VALUE_A } };
        const actual = await EnvConfig.get(GENE_CATEGORY);

        expect(actual).toEqual(expected);
    });
});
