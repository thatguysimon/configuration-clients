# import os
from src.env_config import EnvConfig

# from github_env_conf_loader import GithubEnvConfigLoader
from src.secrets import Secrets

"""
In order to test-run this kitchen sink:

cd python
VAULT_USER=<your vault user> VAULT_PASSWORD=<your vault pass> ENV=kitchen-sink-demo-do-not-delete python src/kitchen_sync.py
"""

# attempting to read the "all" section from the system.json conf file in the configuration repo
v = EnvConfig.SYSTEM("all", None)
print(f"got {v} from system conf [all] section...\n")

# attempting to read a non existing config from the global.json conf file in the configuration repo
v = EnvConfig.get(
    "global",
    "non_existing_section",
    "non_existing_key",
    ["this is a default value as a single list element"],
)
print(f"got {v} from system conf global section...\n")

# reading the common secret
v = Secrets.get("secret/common")
print(
    f"got {v} from vault common...it hit the cache because EnvConfig has already accessed common for git token\n"
)

# reading the common secret again (it hits the cache as the stdout print suggests)
v = Secrets.get("secret/common")
print(f"got {v} from vault common...the cached value again...\n\n")
