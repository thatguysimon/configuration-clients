/* eslint-disable */
export default function flattenJsonKeys(data: unknown): any {
    const result: any = {};
    function recurs(cur: any, prop: any) {
        if (Object(cur) !== cur) {
            result[prop.toString()] = cur;
        } else if (Array.isArray(cur)) {
            for (var i = 0, l = cur.length; i < l; i++) recurs(cur[i], `${prop}[${i}]`);
            if (l == 0) result[prop] = [];
        } else {
            let isEmpty = true;
            for (const p in cur) {
                isEmpty = false;
                recurs(cur[p], prop ? `${prop}.${p}` : p);
            }
            if (isEmpty && prop) result[prop] = {};
        }
    }
    recurs(data, '');
    return result;
}

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


export function jsonOverride(target:any, source:any):any {
    const result = JSON.parse(JSON.stringify(target)); // deep copying target

    for (const [key, value] of Object.entries(source)) {
        if (result.hasOwnProperty(key)) {
            if (typeof result[key] !== 'object') {
                result[key] = value;
            } else {
                result[key] = jsonOverride(result[key], value);
            }
        } else {
            result[key] = value;
        }
    }

    return result;
}