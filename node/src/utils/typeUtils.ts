
/**
 * helper function to converting string values into another type that is dynamically given.
 * @param typeName - either of "string", "float", "int", "bool"
 * @param stringValue - value to convert
 */
function dynamicTypeConverter(typeName: string, stringValue: string): any {
  switch (typeName) {
    case "string":
    case "String":
      return stringValue
    case "Int":
    case "int":
    case "integer":
    case "Integer":
      const convInt: number = parseInt(stringValue)
      if (isNaN(convInt)) {
        throw new TypeError(`expected ${stringValue} to be an integer`)
      }
      return convInt;
    case "float":
    case "Float":
      const convFl: number = parseFloat(stringValue);
      if (isNaN(convFl)) {
        throw new TypeError(`expected ${stringValue} to be an integer`)
      }
      return convFl;
    case "bool":
    case "Bool":
    case "Boolean":
    case "boolean":
      if (stringValue === "True" || stringValue == "true" || stringValue == "TRUE" || stringValue == "1") {
        return true;
      }
      if (stringValue === "False" || stringValue == "false" || stringValue === "FALSE" || stringValue === "0") {
        return false;
      }
      throw new TypeError(`Cannot convert ${stringValue} to boolean`)
    default:
      throw new TypeError(`Unknown or unsupported var type: ${typeName}`)
  }
}


export { dynamicTypeConverter }