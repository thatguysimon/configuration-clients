from src.env_config import EnvConfig
from src.secrets import Secrets
from src.os_vars import OSVars
from src.config_builder import ConfigBuilder
from src.logger import Logger

ConfigBuilder().build("../.envConfig.yml")


#############################################################################
# USAGE                                                                     #
#############################################################################

"""
In order to test-run this kitchen sink:

- cd python
- pip install -r requirements.txt

# the below is a happy path...
- VAULT_USER=<your vault user> VAULT_PASSWORD=<your vault pass> TWIST_ENV=kitchen-sink-demo-do-not-delete python kitchen_sink.py

# omit "VAULT_USER" in order to yield the mandatory-missing var. Pay attention it will sys.EXIT!
# add "__CONFIG_USAGE=1" in order to view required/dependable list of env vars
# add "__DUMP_CONFIG=1" in order to dump the actual env var values.
"""

#############################################################################
# OS / ENVIRONMENT VARS                                                     #
#############################################################################

v = OSVars.get("COMPANY")
Logger.info(f"Company name provided by os env is: {v} and its type is: {type(v)}")


#############################################################################
# ENV CONFIGURATION (using github)                                          #
#############################################################################

# visit https://github.com/Twistbioscience/configuration/tree/kitchen-sink-demo-do-not-delete
# in order to examine concrete values involved in this example.

# attempting to read the "all" section from the system.json conf file in the configuration repo
v = EnvConfig.SYSTEM("all", None)
Logger.info(f"got {v} from system conf [all] section...\n")

# attempting to read the all.some_demo_key value from the system.json conf file in the configuration repo
v = EnvConfig.SYSTEM("all", "some_demo_key")
Logger.info(f"got {v} from system conf [all.some_demo_key]...\n")

v = EnvConfig.GLOBAL("test", "float", 333.333)
Logger.info(f"got {v} from global conf [test.float]...\n")

# attempting to read a non existing config from the global.json conf file in the configuration repo
v = EnvConfig.get(
    "global",
    "non_existing_section",
    "non_existing_key",
    ["this is a default value as a single list element"],
)
Logger.info(f"got {v} from system conf global section...\n")


#############################################################################
# READING SECRETS                                                           #
#############################################################################

# reading the common secret - see .envConfig.yml for secret mapping
v = Secrets.get("common")
Logger.info(
    f"got {v} from vault common...it hit the cache because EnvConfig has already accessed common for git token\n"
)

# reading the common secret again (it hits the cache as the stdout Logger.info suggests)
v = Secrets.get("common")
Logger.info(f"got {v} from vault common...the cached value again...\n\n")


# attempting to read dummy from the dummy.json conf file that is not in existence
# in the conf repo - this should fail
v = EnvConfig.DUMMY("dummy", "some_dummy_key")
