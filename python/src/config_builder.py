#!/usr/bin/env python

import yaml
from os_vars import OSVars
from env_config import EnvConfig

yaml_type_to_python = {"String": str, "Bool": bool, "Int": int, "Float": float}


class ConfigBuilder:
    def __init__(self):
        pass

    def __build_os_vars(self, data):
        for (env_var_name, env_var_data) in data["env-vars"].items():
            print(f"var name: {env_var_name}")
            if "is_mandatory" in env_var_data:
                OSVars.register_mandatory(
                    env_var_name,
                    env_var_data["description"],
                    yaml_type_to_python[env_var_data["type"]],
                )
            else:
                default_val = None
                if "default" not in env_var_data:
                    default_val = env_var_data["default"]

                OSVars.register(
                    env_var_name,
                    env_var_data["description"],
                    yaml_type_to_python[env_var_data["type"]],
                    default_val,
                )

    def __build_conf(self, data):
        # for categories in data["config"]:
        # EnvConfig.
        pass

    def build(self):
        env_file = open("../.envConfig.yml", "r")
        data = yaml.load(env_file, Loader=yaml.CLoader)
        # print(f"yaml data is {data}")

        self.__build_os_vars(data)
        OSVars.initialize()

        self.__build_conf(data)


ConfigBuilder().build()
