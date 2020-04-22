"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const EnvConfig_1 = __importDefault(require("./src/EnvConfig"));
const OSVars_1 = __importDefault(require("./src/OSVars"));
const Secrets_1 = __importDefault(require("./src/Secrets"));
const ConfigBuilder_1 = __importDefault(require("./src/ConfigBuilder"));
/* eslint-disable no-console */
// #############################################################################
// # USAGE                                                                     #
// #############################################################################
/*
  In order to test-run this kitchen sink:

    > cd node
    > npm i

    # the below is a happy path...
    > VAULT_USER=<your vault user> VAULT_PASSWORD=<your vault pass> TWIST_ENV=kitchen-sink-demo-do-not-delete COMPANY=Google npm run demo

   # omit "VAULT_USER" in order to yield the mandatory-missing var. Pay attention it will sys.EXIT!
   # add "__CONFIG_USAGE=1" in order to view required/dependable list of env vars
   # add "__DUMP_CONFIG=1" in order to dump the actual env var values.
   */
// #############################################################################
// # OS / ENVIRONMENT VARS                                                     #
// #############################################################################
function demoOsVars() {
    const v = OSVars_1.default.get('COMPANY');
    console.log(`Company name provided by os env is: ${v} and its type is: ${typeof v}`);
}
// #############################################################################
// # ENV CONFIGURATION (using github)                                          #
// #############################################################################
// visit https://github.com/Twistbioscience/configuration/tree/kitchen-sink-demo-do-not-delete
// in order to examine concrete values involved in this example.
async function demoConfig() {
    // attempting to read the "all" section from the system.json conf file in the configuration repo
    let v = await EnvConfig_1.default.get('system', 'all');
    console.log(`got ${JSON.stringify(v)} from system conf [all] section...\n`);
    // attempting to read the all.some_demo_key value from the system.json conf file in the configuration repo
    v = await EnvConfig_1.default.get('system', 'all', 'some_demo_key');
    console.log(`got "${v}" from system conf [all.some_demo_key]...\n`);
    // attempting to read a non existing config from the global.json conf file in the configuration repo
    v = await EnvConfig_1.default.get('global', 'non_existing_section', 'non_existing_key', [
        'this is a default value as a single list element',
    ]);
    console.log(`got "${v}" from system conf global section...\n`);
    // using contextual config
    const { HOST, PORT } = await EnvConfig_1.default.get('CONTEXT_TEST', 'MISC', 'SERVICE_X');
    console.log(`Connecting to http://${HOST}:${PORT}...`);
    // the below demonstrates internal URL that is using the ENV_NAME
    const internalSvcURL = await EnvConfig_1.default.get('CONTEXT_TEST', 'MISC', 'INTERNAL_SERVICE_URL');
    console.log(`Connecting internal env service on http://${internalSvcURL}...`);
    v = await EnvConfig_1.default.get('CONTEXT_TEST', 'MISC', 'TRANSLATED_THANKS');
    console.log(`translated text: ${v}`);
    // the below should fail and exit the process
    v = await EnvConfig_1.default.get('dummy', 'non_existing_section', 'non_existing_key', [
        'this is a default value as a single list element',
    ]);
    console.log(`got "${v}" from system conf global section...\n`);
}
// #############################################################################
// # READING SECRETS                                                           #
// #############################################################################
async function demoSecrets() {
    // reading the common secret
    const v1 = await Secrets_1.default.get('common');
    console.log(`got ${JSON.stringify(v1)} from vault common`);
    // reading the common secret again(it hits the cache as the stdout print suggests)
    const v2 = await Secrets_1.default.get('common');
    console.log(`got ${JSON.stringify(v2)} from vault common...the cached value again...\n\n`);
}
/* eslint-disable @typescript-eslint/no-floating-promises */
async function main() {
    const cb = new ConfigBuilder_1.default({ language: 'hebrew' });
    await cb.build('../.envConfig.yml');
    demoOsVars();
    await demoSecrets();
    await demoConfig();
}
main();
//# sourceMappingURL=kitchenSink.js.map