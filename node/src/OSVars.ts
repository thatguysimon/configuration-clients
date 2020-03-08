import { dynamicTypeConverter } from './utils/typeUtils';

const DUMP_CONFIG_ENV_VAR = '__DUMP_CONFIG';
const PRINT_CONFIG_USAGE_ENV_VAR = '__CONFIG_USAGE';

export enum OSVarType {
    String = 'string',
    Float = 'float',
    Int = 'int',
    Boolean = 'bool',
}

export default class OSVars {
    private static __instance: OSVars;

    private __vars: any;

    private __initialized: boolean;

    private __canExit: boolean;

    private __shouldPrintUsage: boolean;

    private __shouldDumpConfig: boolean;

    private constructor() {
        this.__initialized = false;

        // The registered vars mem db
        this.__vars = {};
        // by default, when critical requirement is invalid then sys.exit except when dumping
        this.__canExit = !process.env[PRINT_CONFIG_USAGE_ENV_VAR] && !process.env[DUMP_CONFIG_ENV_VAR];

        this.__shouldPrintUsage = PRINT_CONFIG_USAGE_ENV_VAR in process.env;
        this.__shouldDumpConfig = DUMP_CONFIG_ENV_VAR in process.env;
    }

    public static get instance(): OSVars {
        if (!OSVars.__instance) {
            OSVars.__instance = new OSVars();
        }

        return OSVars.__instance;
    }

    /**
     * initialization is required once all required env vars have been registered (see methods below)
     * it will validate (mandatory and types) and set the actual values to be used by consuming modules.
     */
    public static initialize() {
        OSVars.instance.__validateAndSet();
        OSVars.instance.__initialized = true;
    }

    /**
     * declaring an optional env variable
     * @param varKey - name of the expected env var (Ex. TWIST_ENV, REDIS_URL...)
     * @param varDescription - text describing aim and usage of this declared var
     * @param varType - type of var (for validation) default is "string" can also be "int", "float", "bool"
     * @param defaultValue - default to use in case var isn't provided via environment
     */
    public static register(
        varKey: string,
        varDescription: string,
        varType: OSVarType = OSVarType.String,
        defaultValue: any = undefined,
    ): void {
        return OSVars.instance.__register(varKey, varDescription, varType, false, defaultValue);
    }

    /**
     * declaring a mandatory env variable
     * @param varKey - name of the expected env var (Ex. TWIST_ENV, REDIS_URL...)
     * @param varDescription - text describing aim and usage of this declared var
     * @param varType - type of var (for validation) default is "string" can also be "int", "float", "bool"
     */
    public static registerMandatory(
        varKey: string,
        varDescription: string,
        varType: OSVarType = OSVarType.String,
    ): void {
        return OSVars.instance.__register(varKey, varDescription, varType, true);
    }

    /**
    main validation and assignment method. Should be preferably called after all env vars have been registered (see initialize method)
    validates all defined env vars to:
    1. exist in os.environ if var is mandatory
    2. have provided value that adheres to registered type
    then it sets mem db (__vars) value to the actual (default or process.env provided)
  */
    private __validateAndSet(): void {
        Object.entries(this.__vars).forEach(([varKey, obj]) => {
            const varObj: any = obj;
            // default case if the other conditions dont apply
            let value = varObj.defaultValue;

            if (!(varKey in process.env)) {
                if (varObj.isMandatory) {
                    this.__criticalFault(`Missing mandatory os env var ${varKey} (${varObj.description})`);
                }
            } else {
                value = process.env[varKey];
            }

            // type checking and casting
            if (varObj.varType !== 'string') {
                try {
                    value = dynamicTypeConverter(varObj.varType, value);
                } catch (ex) {
                    this.__criticalFault(
                        `provided value for ${varKey} is expected to be ${varObj.varType} but its not\nDetailed exception: ${ex}`,
                    );
                }
            }
            // assigning the successfully extracted/converted value
            varObj.value = value;
        });
    }

    private __criticalFault(message: string): void {
        console.log(`ENV VAR ERROR: ${message}`);
        if (this.__canExit) {
            process.exit(1);
        }
    }

    /**
     * The actual var registration method.
     * see the public registration methods for arguments definition
     */
    private __register(
        varKey: string,
        varDescription: string,
        varType: OSVarType = OSVarType.String,
        isMandatory = false,
        defaultValue?: any,
    ) {
        // sanity checks...
        if (varKey in this.__vars) {
            this.__criticalFault(`os var ${varKey} is already registered!`);
        }

        if (defaultValue !== undefined && isMandatory) {
            this.__criticalFault(`defining var ${varKey} as mandatory with default value doesn't make sense!`);
        }

        this.__vars[varKey] = {
            description: varDescription,
            varType,
            // value: value, // responsibility of __validateAndSet
            isMandatory,
            defaultValue,
        };

        // console.log("after __register. __vars: " + JSON.stringify(this.__vars))
    }

    public static get(varKey: string): any {
        return OSVars.instance.__get(varKey);
    }

    private __get(varKey: string): any {
        if (this.__shouldPrintUsage) {
            this.usage();
            process.exit(0);
        } else if (this.__shouldDumpConfig) {
            this.dump();
            // this is a one time endeavor
            this.__shouldDumpConfig = false;
        }

        if (!this.__initialized) {
            throw new Error('OSVars has not been initialized. call OSVars.initialize()');
        }

        if (!(varKey in this.__vars)) {
            throw new Error(
                `${varKey} unknown. Please specify variable attributes using the register method in the process initialization(!)`,
            );
        }

        return this.__vars[varKey].value;
    }

    public usage(): void {
        if (!this.__initialized) {
            throw new Error('OSVars has not been initialized. call OSVars.initialize()');
        }

        const mandatorySign: any = { false: '', true: '* ' };

        console.log('\n\nEnvironment variables usage:\n');
        Object.entries(this.__vars).forEach(([varKey, obj]) => {
            const varObj: any = obj;
            const defaultValue: string = varObj.default ? varObj.default : '';

            console.log(
                `${mandatorySign[varObj.isMandatory]}${varKey} (${varObj.varType}): ${
                    varObj.description
                }${defaultValue}`,
            );
        });
        // epilogue
        console.log(`
      * - mandatory vars
      ${PRINT_CONFIG_USAGE_ENV_VAR}: set to any to produce this usage print
      ${DUMP_CONFIG_ENV_VAR}: set to any to dump actual env vars values\n
    `);
    }

    public dump() {
        if (!this.__initialized) {
            throw new Error('OSVars has not been initialized. call OSVars.initialize()');
        }

        console.log('\n\nEnvironment variables mem dump:\n');
        Object.entries(this.__vars).forEach(([varKey, obj]) => {
            const varObj: any = obj;
            const defaultVal = varObj.default ? `. (Default: ${varObj.default})` : '';

            console.log(`${varKey}: ${varObj.value} \n\t${varObj.description}${defaultVal}`);
        });
        console.log('\n\n');
    }
}
