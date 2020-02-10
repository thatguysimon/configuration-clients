#!/usr/bin/env python

import yaml
import os
import logging
from .os_vars import OSVars
from .env_config import EnvConfig
from .env_conf_loader_factory import EnvConfigLoaderFactory
from .secrets import Secrets
from .logger import Logger

yaml_type_to_python = {"String": str, "Bool": bool, "Int": int, "Float": float}


class ConfigBuilder:
    def __init__(self):
        pass

    def __build_os_vars(self, data):
        for (env_var_name, env_var_data) in data["env-vars"].items():
            # print(f"var name: {env_var_name}, var data: {env_var_data}")
            if "is_mandatory" in env_var_data and env_var_data["is_mandatory"] is True:
                OSVars.register_mandatory(
                    env_var_name,
                    env_var_data["description"],
                    yaml_type_to_python[env_var_data["type"]],
                )
            else:
                default_val = None
                if "default" in env_var_data:
                    default_val = env_var_data["default"]

                OSVars.register(
                    env_var_name,
                    env_var_data["description"],
                    yaml_type_to_python[env_var_data["type"]],
                    default_val,
                )

    def __build_conf(self, data):
        if "config" not in data:
            return

        conf_data = data["config"]
        conf_provider_name = None
        if "provider" in conf_data:
            conf_provider_name = conf_data["provider"]

        conf_loader = EnvConfigLoaderFactory().get_loader(conf_provider_name)

        if "parent_environments" in conf_data:
            EnvConfig.instance().set_env_fallback(conf_data["parent_environments"])

        EnvConfig.instance().set_loader(conf_loader)

        if "categories" not in conf_data:
            return

        for category in conf_data["categories"]:
            EnvConfig.instance().require_category(category)

    def __build_secrets(self, data):
        if "secrets" not in data:
            return

        secrets_conf = data["secrets"]

        if "required" in secrets_conf:
            for secret_key in secrets_conf["required"]:
                try:
                    Secrets.get(secret_key)
                except Exception as e:
                    raise Exception(
                        f"Failed fetching Secrets key {secret_key}. Error: {e}"
                    )

    def __build_logger(self, data):
        logging.getLogger("requests").setLevel(logging.WARNING)

        log_level = None
        colored = False

        if "logger" in data:
            if "level" in data["logger"]:
                log_level = data["logger"]["level"]
            if "colored" in data["logger"]:
                colored = data["logger"]["colored"]

        Logger.instance().initialize(log_level, colored)

    def build(self, path_to_env_yaml=None):
        path = path_to_env_yaml
        if path_to_env_yaml is None:
            path = os.getcwd() + "/.envConfig.yml"

        print(f"Attempting to read env config yaml from {path}")
        env_file = open(path, "r")
        data = yaml.load(env_file, Loader=yaml.CLoader)
        # print(f"yaml data is {data}")

        self.__build_logger(data)

        self.__build_os_vars(data)
        OSVars.initialize()

        self.__build_secrets(data)

        self.__build_conf(data)
