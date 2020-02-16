export function flattenJsonKeys(data: unknown): any {
    var result: any = {};
    function recurs(cur: any, prop: any) {
        if (Object(cur) !== cur) {
            result[prop.toString()] = cur;
        } else if (Array.isArray(cur)) {
            for (var i = 0, l = cur.length; i < l; i++)
                recurs(cur[i], prop + "[" + i + "]");
            if (l == 0)
                result[prop] = [];
        } else {
            var isEmpty = true;
            for (var p in cur) {
                isEmpty = false;
                recurs(cur[p], prop ? prop + "." + p : p);
            }
            if (isEmpty && prop)
                result[prop] = {};
        }
    }
    recurs(data, "");
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