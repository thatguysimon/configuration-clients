"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MockConfigLoader {
    constructor() {
        this.__categories = [];
        this.__env = '';
        this.__fallback = [];
    }
    async setEnv(env, fallback) {
        this.__env = env;
        this.__fallback = fallback;
        console.log(`env is ${this.__env} and fb: ${this.__fallback}`);
        return true;
    }
    async load(category) {
        try {
            return this.__data[category.toUpperCase()];
        }
        catch (ex) {
            return {};
        }
    }
    async listCategories() {
        return this.__categories;
    }
    mockSetCategories(categories) {
        this.__categories = categories;
    }
    mockSetData(data) {
        this.__data = data;
    }
}
exports.default = MockConfigLoader;
//# sourceMappingURL=MockConfigLoader.js.map