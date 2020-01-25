import EnvConfig from './EnvConfig';


// in order to run:
// npm i
// TWIST_ENV=kitchen-sink-demo-do-not-delete npm run demo

// #############################################################################
// # ENV CONFIGURATION (using github)                                          #
// #############################################################################

// visit https://github.com/Twistbioscience/configuration/tree/kitchen-sink-demo-do-not-delete
// in order to examine concrete values involved in this example.


async function main() {
  // attempting to read the "all" section from the system.json conf file in the configuration repo
  let v = await EnvConfig.get("system", 'all');
  console.log(`got ${JSON.stringify(v)} from system conf [all] section...\n`);

  // attempting to read the all.some_demo_key value from the system.json conf file in the configuration repo
  v = await EnvConfig.get("system", "all", "some_demo_key")
  console.log(`got "${v}" from system conf [all.some_demo_key]...\n`)

  // attempting to read a non existing config from the global.json conf file in the configuration repo
  v = await EnvConfig.get(
    "global",
    "non_existing_section",
    "non_existing_key",
    ["this is a default value as a single list element"]
  )
  console.log(`got "${v}" from system conf global section...\n`)
}

main()