"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamicTypeConverter = void 0;
/**
 * helper function to converting string values into another type that is dynamically given.
 * @param typeName - either of "string", "float", "int", "bool"
 * @param stringValue - value to convert
 */
function dynamicTypeConverter(typeName, stringValue) {
    let convInt;
    let convFl;
    switch (typeName.toLowerCase()) {
        case 'string':
            return stringValue;
        case 'int':
        case 'integer':
            convInt = parseInt(stringValue, 10);
            if (Number.isNaN(convInt)) {
                throw new TypeError(`expected ${stringValue} to be an integer`);
            }
            return convInt;
        case 'float':
            convFl = parseFloat(stringValue);
            if (Number.isNaN(convFl)) {
                throw new TypeError(`expected ${stringValue} to be an integer`);
            }
            return convFl;
        case 'bool':
        case 'boolean':
            if (stringValue === 'True' || stringValue === 'true' || stringValue === 'TRUE' || stringValue === '1') {
                return true;
            }
            if (stringValue === 'False' || stringValue === 'false' || stringValue === 'FALSE' || stringValue === '0') {
                return false;
            }
            throw new TypeError(`Cannot convert ${stringValue} to boolean`);
        default:
            throw new TypeError(`Unknown or unsupported var type: ${typeName}`);
    }
}
exports.default = dynamicTypeConverter;
exports.dynamicTypeConverter = dynamicTypeConverter;
//# sourceMappingURL=typeUtils.js.map