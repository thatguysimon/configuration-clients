import IConfigContext from './IConfigContext';

export const CONTEXT_DECLARATION_KEY = '$context';
const TEMPLATE_REGEX = /.*({{)(\s*[\w_\-.]+\s*)(}}).*/;
const PRODUCTION_BRANCH_NAME = 'master';
const STAGING_ENV_CONTEXT_NAME = 'staging';
const PRODUCTION_ENV_CONTEXT_NAME = 'production';

/**
 * json validation -
   making sure no templated token is left unreplaced in any of the json value leafs.
 * @param json 
 * @returns boolean
 */
export function validateNoTemplateLeft(json: any): boolean {
    let found = false;
    Object.values(json).forEach((v: any) => {
        if (typeof v === 'object') {
            found = validateNoTemplateLeft(v);
        } else {
            found = TEMPLATE_REGEX.exec(v) !== null;
        }

        if (found) {
            throw new Error(`could not find a context data for templated value: ${v}`);
        }
    });

    return false;
}

export default class EnvConfigContext implements IConfigContext {
    private __env: string;

    private __data: any = {};

    constructor(env: string) {
        this.__env = env;

        this.add('TWIST_ENV', this.__env);
    }

    /**
     * set contextual data that can be used for config context processing
     * @param key name of context data
     * @param value value of context data. can be str int or anything dictated in context declaration
     */
    add(key: string, value: any): void {
        if (this.__data[key] !== undefined) {
            console.warn(`Context data [${key}] is being overridden from ${this.__data[key]} to ${value}`);
        }

        let theValue = value;

        // the interpretation of production vs staging is done here.
        // all ENV names that are not PRODUCTION_BRANCH_NAME are regarded as staging
        if (key === 'TWIST_ENV') {
            if (value === PRODUCTION_BRANCH_NAME) {
                theValue = PRODUCTION_ENV_CONTEXT_NAME;
            } else {
                theValue = STAGING_ENV_CONTEXT_NAME;
            }
        }

        console.log(`Adding context: ${key} => ${theValue}`);
        this.__data[key] = value;
    }

    __normalize(returnedJson: any): any {
        const theReturnedJson = returnedJson;

        // deleting the context declaration from the to-be-consumed config
        if (returnedJson[CONTEXT_DECLARATION_KEY] !== undefined) {
            delete theReturnedJson[CONTEXT_DECLARATION_KEY];
        }

        // ensuring no value is left with templated place holder(ie " {{ key }} ")
        // the below will raise an exception
        validateNoTemplateLeft(theReturnedJson);

        return theReturnedJson;
    }

    __processContext(jsonData: any, contextData: any): any {
        const theJsonData = jsonData;
        // traverse the jsonData to look for {{ token }} templates to substitute with value from contextData
        // eslint-disable-next-line no-restricted-syntax
        for (const [k, v] of Object.entries(theJsonData)) {
            if (typeof v === 'object') {
                theJsonData[k] = this.__processContext(v, theJsonData);
            } else if (typeof v === 'string') {
                // attempt extracting the templated token from the provided string
                const match = TEMPLATE_REGEX.exec(v);

                // ignore. values that are not templated
                if (!match || match.length !== 4) {
                    continue; // eslint-disable-line no-continue
                }

                // the template token lays inside the match.
                // this is sensitive assumption but it is protected by unit tests! (the regex)
                const keyword = match[2].trim();

                // skip token if context data does not provide value (it will fail later in normalization)
                if (contextData[keyword] === undefined) {
                    continue; // eslint-disable-line no-continue
                }

                // for non str value the config data s replaced as is with the provided context data(even if its dict!)
                // otherwise(string) is replaced "123{{ token  }}789" => "123456789" given contextData["token"] = "456"
                if (typeof contextData[keyword] !== 'string') {
                    console.log(`replacing config key ${k} value from ${theJsonData[k]} to ${contextData[keyword]}`);
                    theJsonData[k] = contextData[keyword];
                } else {
                    const theVal = contextData[keyword];
                    const template = [match[1], match[2], match[3]].join('');
                    const withTemplate = theJsonData[k];
                    theJsonData[k] = theJsonData[k].replace(template, theVal);
                    console.log(`replacing config key ${k} value from ${withTemplate} to ${theJsonData[k]}`);
                }
            }
        }
        return theJsonData;
    }

    public process(configJson: any): any {
        // ensuring manipulation of copied version, never original
        const jsonCopy: any = JSON.parse(JSON.stringify(configJson));

        // in case of no contextual declaration, return the provided json as is.
        if (jsonCopy[CONTEXT_DECLARATION_KEY] === undefined) {
            return this.__normalize(jsonCopy);
        }

        let currentContext = {};

        // per context for:
        // env_name: { ..} AND / OR
        // something: { ... }
        //
        // look for the context key in data(which is affected by TWIST_ENV but any app provided context keys when
        // calling to add method above) - when found - this is the context vlaues to use when parsing the rest
        // of the json
        const contextDeclaration = jsonCopy[CONTEXT_DECLARATION_KEY] || {};
        // eslint-disable-next-line no-restricted-syntax
        for (const [contextDeclKey, contextData] of Object.entries(contextDeclaration)) {
            // eslint-disable-next-line no-restricted-syntax
            for (const [contextDataKey, v] of Object.entries(this.__data)) {
                console.log(
                    `\n ===> context_decl_key: ${contextDeclKey} context_data: ${JSON.stringify(
                        contextData,
                    )} context_data_key: ${contextDataKey} v: ${v}`,
                );
                const contextValue: any = v;
                if (contextDeclKey.toLowerCase() === contextValue.toString().toLowerCase()) {
                    const anyContextData: any = contextData;
                    currentContext = {
                        ...currentContext,
                        ...anyContextData,
                    };
                    break;
                }
            }
        }

        console.log(`detected config context to use: ${JSON.stringify(currentContext)}`);

        // making sure we have context data to work with
        if (Object.keys(currentContext).length === 0) {
            console.log('could not find context data in respect to provided json!');
            return this.__normalize(jsonCopy);
        }

        // replace the templated values from chosen context
        const processedJson = this.__processContext(jsonCopy, currentContext);
        return this.__normalize(processedJson);
    }
}
