
import { dynamicTypeConverter } from '../src/utils/typeUtils'

describe("testing dynamicTypeConverter", () => {
  test("it should happily convert string to string", () => {
    const expected = "kukuMuku";
    const actual = dynamicTypeConverter("string", "kukuMuku");
    expect(actual).toEqual(expected);
  })

  test("it should happily convert int to int", () => {
    const expected = 100;
    const actual = dynamicTypeConverter("int", "100");
    expect(actual).toEqual(expected);
  })

  test("it should happily convert float to float", () => {
    const expected = 100.11;
    const actual = dynamicTypeConverter("float", "100.11");
    expect(actual).toEqual(expected);
  })

  test("it should happily convert boolean to true", () => {
    const expected = true;
    const actual = dynamicTypeConverter("boolean", "TRUE");
    expect(actual).toEqual(expected);
  })

  test("it should happily convert boolean to false", () => {
    const expected = false;
    const actual = dynamicTypeConverter("boolean", "FALSE");
    expect(actual).toEqual(expected);
  })

  test("it should fail converting non boolean to boolean", () => {
    const t = () => {
      dynamicTypeConverter("boolean", "123")
    }
    expect(t).toThrow(TypeError)
  })

  test("it should fail converting NaN to int", () => {
    const t = () => {
      dynamicTypeConverter("int", "kuku")
    }
    expect(t).toThrow(TypeError)
  })

  test("it should fail converting NaN to float", () => {
    const t = () => {
      dynamicTypeConverter("float", "kuku")
    }
    expect(t).toThrow(TypeError)
  })

  test("it should fail converting number > 1 to boolean", () => {
    const t = () => {
      dynamicTypeConverter("bool", "3")
    }
    expect(t).toThrow(TypeError)
  })

  test("it should fail converting not-a-boolean-string to boolean", () => {
    const t = () => {
      dynamicTypeConverter("bool", "kuku")
    }
    expect(t).toThrow(TypeError)
  })

  test("it should fail converting empty to boolean", () => {
    const t = () => {
      dynamicTypeConverter("bool", "")
    }
    expect(t).toThrow(TypeError)
  })

  test("it should fail converting empty to int", () => {
    const t = () => {
      dynamicTypeConverter("int", "")
    }
    expect(t).toThrow(TypeError)
  })

  test("it should fail converting empty to float", () => {
    const t = () => {
      dynamicTypeConverter("float", "")
    }
    expect(t).toThrow(TypeError)
  })
})