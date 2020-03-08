"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const EnvConfig_1 = __importDefault(require("../src/EnvConfig"));
const EnvConfigContext_1 = __importDefault(require("../src/EnvConfigContext"));
const MockConfigLoader_1 = __importDefault(require("./MockConfigLoader"));
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
describe('Test EnvConfig Traits', () => {
    let configLoader;
    beforeEach(async () => {
        configLoader = new MockConfigLoader_1.default();
        process.env[EnvConfig_1.default.TWIST_ENV_KEY] = 'dummyEnv';
        await configLoader.setEnv('dummy', []);
    });
    async function mockConfig(categories, data) {
        configLoader.mockSetCategories(categories);
        configLoader.mockSetData(data);
        await EnvConfig_1.default.instance.setLoader(configLoader);
        EnvConfig_1.default.instance.setContextHandler(new EnvConfigContext_1.default('dummyEnv'));
    }
    test('test that EnvConfig is a singleton', async () => {
        expect(EnvConfig_1.default.instance).toBeInstanceOf(EnvConfig_1.default);
    });
    test('test that none existing section returns default', async () => {
        await mockConfig([GLOBAL_CATEGORY], MOCK_DATA);
        const expected = DEFAULT_VALUE;
        const actual = await EnvConfig_1.default.get(GLOBAL_CATEGORY, NON_EXISTING_SECTION_NAME, NON_EXISTING_KEY_NAME, expected);
        expect(actual).toEqual(expected);
    });
    test('test that none existing key returns default', async () => {
        await mockConfig([GLOBAL_CATEGORY], MOCK_DATA);
        const expected = DEFAULT_VALUE;
        const actual = await EnvConfig_1.default.get(GLOBAL_CATEGORY, SECTION_NAME, NON_EXISTING_KEY_NAME, expected);
        expect(actual).toEqual(expected);
    });
    test('test that none existing category throws exception', async () => {
        await mockConfig([GLOBAL_CATEGORY], MOCK_DATA);
        const expected = undefined;
        let actual;
        try {
            await EnvConfig_1.default.get('DUMMY', SECTION_NAME, NON_EXISTING_KEY_NAME, expected);
        }
        catch (ex) {
            actual = ex;
        }
        expect(actual).toBeInstanceOf(Error);
    });
    test('test that existing key to return actual value', async () => {
        await mockConfig([GLOBAL_CATEGORY], MOCK_DATA);
        const expected = GENE_KEY_VALUE_A;
        const actual = await EnvConfig_1.default.get(GENE_CATEGORY, SECTION_NAME, GENE_KEY_NAME_A);
        expect(actual).toEqual(expected);
    });
    test('test that existing key to return actual value even when default provided', async () => {
        await mockConfig([GLOBAL_CATEGORY], MOCK_DATA);
        const expected = GENE_KEY_VALUE_A;
        const actual = await EnvConfig_1.default.get(GENE_CATEGORY, SECTION_NAME, GENE_KEY_NAME_A, DEFAULT_VALUE);
        expect(actual).toEqual(expected);
    });
    test('test get none existing key and section to return whole section', async () => {
        await mockConfig([GLOBAL_CATEGORY], MOCK_DATA);
        const expected = { [GENE_KEY_NAME_A]: GENE_KEY_VALUE_A };
        const actual = await EnvConfig_1.default.get(GENE_CATEGORY, SECTION_NAME);
        expect(actual).toEqual(expected);
    });
    test('test get only category expected to return whole category config', async () => {
        await mockConfig([GLOBAL_CATEGORY], MOCK_DATA);
        const expected = { [SECTION_NAME]: { [GENE_KEY_NAME_A]: GENE_KEY_VALUE_A } };
        const actual = await EnvConfig_1.default.get(GENE_CATEGORY);
        expect(actual).toEqual(expected);
    });
});
//# sourceMappingURL=EnvConfig.test.js.map