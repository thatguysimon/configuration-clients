#!/usr/bin/env python


#############################################################################
# HEADER                                                                    #
#############################################################################
"""
Base class and implementation of config context
"""

#############################################################################
# IMPORT MODULES                                                            #
#############################################################################
import copy
import re
from .logger import Logger
from .common import ENV_VAR_NAME
from .common import get_contextual_env

#############################################################################
# IMPLEMENTATION                                                            #
#############################################################################

CONTEXT_DECLARATION_KEY = "$context"
TEMPLATE_REGEX = r".*({{)(\s*[\w_\-\.]+\s*)(}}).*"


def validate_no_template_left(json):
    """
    validation of a dictionary -
    making sure no templated token is left unreplaced in any of the json value leafs.

    Arguments:
        json {dict} -- the validated dictionary

    Raises:
        Exception: describing the unreplaced template

    Returns:
        [bool] -- False - all ok, Exception otherwise
    """
    found = False
    for v in json.values():
        if isinstance(v, dict):
            found = validate_no_template_left(v)
        elif isinstance(v, str):
            found = re.search(TEMPLATE_REGEX, v) is not None

        if found:
            raise Exception(f"could not find a context data for templated value: {v}")
    return False


class EnvConfigContext:
    """
    An implementation for config context handling, assisting EnvConf in processing
    context related declerations and values.
    """

    def __init__(self, env):
        self.__data = {}
        self.__env = env

        self.add(ENV_VAR_NAME, self.__env)

    def add(self, key, value):
        """
        set contextual data that can be used for config context processing

        Arguments:
            key {str} -- name of context data
            value {any} -- value of context data. can be str int or anything dictated in context declaration
        """
        if key in self.__data:
            Logger.debug(
                f"Context data [{key}] is being overriden from {self.__data[key]} to {value}"
            )

        # the interpretation of production vs staging is done here.
        # all ENV names that are not PRODUCTION_BRANCH_NAME are regarded as staging
        if key == ENV_VAR_NAME:
            value = get_contextual_env()

        Logger.debug(f"Adding context: {key} => {value}")
        self.__data[key] = value

    def __normalize(self, returned_json):
        # deleting the context declaration from the to-be-consumed config
        if CONTEXT_DECLARATION_KEY in returned_json:
            del returned_json[CONTEXT_DECLARATION_KEY]

        # ensuring no value is left with templated place holder (ie " {{ key }} ")
        # the below will raise an exception
        validate_no_template_left(returned_json)

        return returned_json

    def __process_context(self, json_data, context_data):
        # traverse the json to look for {{ token }} templates to substitute with value from context
        for k, v in json_data.items():
            if isinstance(v, dict):
                json_data[k] = self.__process_context(v, context_data)
            elif isinstance(v, str):
                # attempt extracting the templated token from the provided string
                match = re.search(TEMPLATE_REGEX, v)
                # ignore values that are not templated
                if match is None:
                    continue
                # the template token lays inside the match.
                # this is sensitive assumption but it is protected by unit tests! (the regex)
                keyword = match.groups()[1].strip()
                # skip token if context data does not provide value (it will fail later in normalization)
                if keyword not in context_data:
                    continue
                # for non str value the config data s replaced as is with the provided context data (even if its dict!)
                # otherwise (string) is replaced "123{{ token  }}789" => "123456789" given context_data["token"] = "456"
                if isinstance(context_data[keyword], str) is False:
                    Logger.debug(
                        f"replacing config key {k} value from {json_data[k]} to {context_data[keyword]}"
                    )
                    json_data[k] = context_data[keyword]
                else:
                    the_val = context_data[keyword]
                    template = "".join(match.groups())
                    with_template = json_data[k]
                    json_data[k] = json_data[k].replace(template, the_val)
                    Logger.debug(
                        f"replacing config key {k} value from {with_template} to {json_data[k]}"
                    )
        return json_data

    def process(self, config_json):
        # ensuring manipulation of copied version, never original
        copy_json = copy.deepcopy(config_json)
        # in case of no contextual declaration, return the provided json as is.
        if CONTEXT_DECLARATION_KEY not in copy_json:
            return self.__normalize(copy_json)

        current_context = {}

        # per context for:
        # env_name: { .. } AND/OR
        # somthing: { ... }
        #
        # look for the context key in data (which is affected by TWIST_ENV but any app provided context keys when
        # calling to add method above) - when found - this is the context vlaues to use when parsing the rest
        # of the json
        context_decleration = copy_json[CONTEXT_DECLARATION_KEY] or {}
        for context_decl_key, context_data in context_decleration.items():
            for context_data_key, v in self.__data.items():
                # print(
                #     f"\n ===> context_decl_key: {context_decl_key} context_data: {context_data} context_data_key: {context_data_key} v: {v}"
                # )
                if context_decl_key.lower() == v.lower():
                    current_context = {**current_context, **context_data}
                    break

        Logger.debug(f"detected config context to use: {current_context}")

        # making sure we have context data to work with
        if len(current_context.items()) == 0:
            Logger.debug("could not find context data in respect to provided json!")
            return self.__normalize(copy_json)

        # replace the templated valued from chosen context
        processed_json = self.__process_context(copy_json, current_context)

        return self.__normalize(processed_json)
