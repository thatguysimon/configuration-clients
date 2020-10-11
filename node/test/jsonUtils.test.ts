import { jsonOverride } from '../src/utils/jsonUtils';

describe('testing jsonOverride', () => {
    test('expected to find a simple additive override', () => {
        const a = { a: 1 };
        const b = { b: 2 };
        const expected = { a: 1, b: 2 };
        const actual = jsonOverride(a, b);
        expect(actual).toEqual(expected);
    });

    test('expected to find a simple override', () => {
        const a = { a: 1 };
        const b = { a: 2 };
        const expected = { a: 2 };
        const actual = jsonOverride(a, b);
        expect(actual).toEqual(expected);
    });

    test('expected to find a nested additive override', () => {
        const a = { a: 1, n: { x: 1 } };
        const b = { n: { y: 2 } };
        const expected = { a: 1, n: { x: 1, y: 2 } };
        const actual = jsonOverride(a, b);
        expect(actual).toEqual(expected);
    });

    test('expected to find a nested override', () => {
        const a = { a: 1, n: { x: 1 } };
        const b = { n: { x: 2 } };
        const expected = { a: 1, n: { x: 2 } };
        const actual = jsonOverride(a, b);
        expect(actual).toEqual(expected);
    });

    test('expected to find a nested list override', () => {
        const a = { a: 1, n: { x: ['a', 'b'] } };
        const b = { n: { x: [1, 2, 3] } };
        const expected = { a: 1, n: { x: [1, 2, 3] } };
        const actual = jsonOverride(a, b);
        expect(actual).toEqual(expected);
    });

    test('expected to find a list override and add mix', () => {
        const a = { a: 1, n: { x: ['a', 'b'] } };
        const b = { b: 2, n: { x: [1, 2, 3], z: 'abc' } };
        const expected = { a: 1, b: 2, n: { x: [1, 2, 3], z: 'abc' } };
        const actual = jsonOverride(a, b);
        expect(actual).toEqual(expected);
    });
});
