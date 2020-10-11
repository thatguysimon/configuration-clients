"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonOverride = void 0;
/* eslint-disable */
function flattenJsonKeys(data) {
    const result = {};
    function recurs(cur, prop) {
        if (Object(cur) !== cur) {
            result[prop.toString()] = cur;
        }
        else if (Array.isArray(cur)) {
            for (var i = 0, l = cur.length; i < l; i++)
                recurs(cur[i], `${prop}[${i}]`);
            if (l == 0)
                result[prop] = [];
        }
        else {
            let isEmpty = true;
            for (const p in cur) {
                isEmpty = false;
                recurs(cur[p], prop ? `${prop}.${p}` : p);
            }
            if (isEmpty && prop)
                result[prop] = {};
        }
    }
    recurs(data, '');
    return result;
}
exports.default = flattenJsonKeys;
// const test = {
//   'family': {
//     'father': {
//       'age': 500,
//       'name': 'joe',
//       'job': {
//         'title': 'chef',
//         'work': {
//           'place': 'ny'
//         }
//       }
//     },
//     'mother': 'mama'
//   }
// }
// console.log(`flat: ${JSON.stringify(flattenJson(test))}`)
// output:
// flat: {"family.father.age":500,"family.father.name":"joe","family.father.job.title":"chef","family.father.job.work.place":"ny","family.mother":"mama"}
function jsonOverride(target, source) {
    const result = JSON.parse(JSON.stringify(target)); // deep copying target
    for (const [key, value] of Object.entries(source)) {
        if (result.hasOwnProperty(key)) {
            if (typeof result[key] !== 'object') {
                result[key] = value;
            }
            else {
                result[key] = jsonOverride(result[key], value);
            }
        }
        else {
            result[key] = value;
        }
    }
    return result;
}
exports.jsonOverride = jsonOverride;
//# sourceMappingURL=jsonUtils.js.map