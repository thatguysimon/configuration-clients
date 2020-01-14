# import os
# from env_config import EnvConfig
# from github_env_conf_loader import GithubEnvConfig


# EnvConfig.instance().set_loader(GithubEnvConfig(os.environ["ENV"]))

# v = EnvConfig.SYSTEM("all", None)
# print(f"got {v} from system conf...")

# v = EnvConfig.GLOBAL("z", "x", "default")
# print(f"got {v} from global conf...")

# v = EnvConfig.GLOBAL(None, None)
# print(f"got {v} from global conf...")
