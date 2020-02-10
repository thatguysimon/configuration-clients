from src.env_config import EnvConfig
from src.secrets import Secrets
from src.os_vars import OSVars
from src.config_builder import ConfigBuilder

ConfigBuilder().build("../.envConfig.yml")

#############################################################################
# USAGE                                                                     #
#############################################################################

"""
In order to test-run this kitchen sink:

- cd python

# the below is a happy path...
- VAULT_USER=<your vault user> VAULT_PASSWORD=<your vault pass> TWIST_ENV=kitchen-sink-demo-do-not-delete python kitchen_sink.py

# omit "VAULT_USER" in order to yield the mandatory-missing var. Pay attention it will sys.EXIT!
# add "__CONFIG_USAGE=1" in order to view required/dependable list of env vars
# add "__DUMP_CONFIG=1" in order to dump the actual env var values.
"""

#############################################################################
# OS / ENVIRONMENT VARS                                                     #
#############################################################################

# mandatory env vars ALREADY(!!!) registered by Secrets and EnvConfig...
# OSVars.register_mandatory("VAULT_USER", "Vault secret management user name", str)
# OSVars.register_mandatory("VAULT_PASSWORD", "Vault secret management password", str)
# OSVars.register_mandatory("TWIST_ENV", "running environment name", str)

# optional env var with default value
OSVars.register("COMPANY", "company name", str, "Twist")

# we are done with process initialization, lets start consuming vars
# it is important to place this call in your __main__
OSVars.initialize()

v = OSVars.get("COMPANY")
print(f"Company name provided by os env is: {v} and its type is: {type(v)}")


#############################################################################
# ENV CONFIGURATION (using github)                                          #
#############################################################################

# visit https://github.com/Twistbioscience/configuration/tree/kitchen-sink-demo-do-not-delete
# in order to examine concrete values involved in this example.

# attempting to read the "all" section from the system.json conf file in the configuration repo
v = EnvConfig.SYSTEM("all", None)
print(f"got {v} from system conf [all] section...\n")

# attempting to read the all.some_demo_key value from the system.json conf file in the configuration repo
v = EnvConfig.SYSTEM("all", "some_demo_key")
print(f"got {v} from system conf [all.some_demo_key]...\n")

# attempting to read a non existing config from the global.json conf file in the configuration repo
v = EnvConfig.get(
    "global",
    "non_existing_section",
    "non_existing_key",
    ["this is a default value as a single list element"],
)
print(f"got {v} from system conf global section...\n")


#############################################################################
# READING SECRETS                                                           #
#############################################################################

# reading the common secret
v = Secrets.get("secret/common")
print(
    f"got {v} from vault common...it hit the cache because EnvConfig has already accessed common for git token\n"
)

# reading the common secret again (it hits the cache as the stdout print suggests)
v = Secrets.get("secret/common")
print(f"got {v} from vault common...the cached value again...\n\n")


# attempting to read dummy from the dummy.json conf file that is not in existence
# in the conf repo - this should fail
v = EnvConfig.DUMMY("dummy", "some_dummy_key")
