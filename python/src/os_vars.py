#!/usr/bin/env python

#############################################################################
# HEADER                                                                    #
#############################################################################
"""
encapsulation to environment variables definition, validation and access
"""

#############################################################################
# IMPORT MODULES                                                            #
#############################################################################
import os
import sys

# supposedly, the only unregistered / declared env vars!
DUMP_CONFIG_ENV_VAR = "__DUMP_CONFIG"
PRINT_CONFIG_USAGE_ENV_VAR = "__CONFIG_USAGE"

#############################################################################
# IMPLEMENTATION                                                            #
#############################################################################


class OSVars:
    """
    The OSVars class serving application with clarifying their dependant and expected os/env variables.
    One may use os.environ to get that but when all goes through this class the benefits are:

    1. Encapsulation - no more env var per sporadic demand in sporadic py file
    2. Usage - user can get all of the dependant/expected env vars from the service it is interacting with along with
       their description and default values.
    3. Type validation - env var can be defined to be of type X (ex int) so when it is provided with an unexpected
       value type - the process exists (to prevent unexpected behavior). For unknown types register var as str.
    4. Dump - running service can dump all of its vars and their actual values served to the application (for better analysis)


    Class Public Interface:

      register
      register_mandatory
      get
      usage
      dump
    """

    __instance = None

    @staticmethod
    def instance():
        """ Static access method. """
        if OSVars.__instance is None:
            # the only place the Secrets constructor is being called.
            OSVars()
        return OSVars.__instance

    def __init__(self):
        if OSVars.__instance is None:
            OSVars.__instance = self
        else:
            # should anyone call Secrets directly, make a bold statement about it.
            raise Exception(
                """OSVars object already initialized - you cannot create another instance!
                (hint: use OSVars.instance()"""
            )
        # The registered vars mem db
        self.__vars = {}
        # by default, when critical requirement is invalid then sys.exit except when dumping
        self.__can_exit = (
            PRINT_CONFIG_USAGE_ENV_VAR not in os.environ
            and DUMP_CONFIG_ENV_VAR not in os.environ
        )
        self.__should_print_usage = PRINT_CONFIG_USAGE_ENV_VAR in os.environ
        self.__should_dump_config = DUMP_CONFIG_ENV_VAR in os.environ

    def __critical_fault(self, message):
        print(f"ENV VAR ERROR: {message}")
        if self.__can_exit is True:
            sys.exit(1)

    @staticmethod
    def register(var_key, var_description, var_type=str, default_value=None):
        return OSVars.instance().__register(
            var_key, var_description, var_type, False, default_value
        )

    @staticmethod
    def register_mandatory(var_key, var_description, var_type=str, default_value=None):
        return OSVars.instance().__register(
            var_key, var_description, var_type, True, default_value
        )

    def __register(
        self,
        var_key,
        var_description,
        var_type=str,
        is_mandatory=False,
        default_value=None,
    ):
        # making sure only one registration exists per os env var
        if var_key in self.__vars:
            self.__critical_fault(f"os var {var_key} is already registered!")

        if default_value is not None and is_mandatory is True:
            self.__critical_fault(
                f"defining var {var_key} as mandatory with default value doesn't make sense!"
            )

        # default case if the other conditions dont apply
        value = default_value

        if var_key not in os.environ:
            if is_mandatory is True:
                self.__critical_fault(
                    f"Missing mandatory os env var {var_key} ({var_description})"
                )
        else:
            value = os.environ[var_key]

        # type checking and casting
        if var_type != str:
            try:
                value = var_type(value)
            except Exception as ex:
                self.__critical_fault(
                    f"provided value for {var_key} is expected to be {var_type} but its not (actual: {type(value)})\nDetailed exception: {type(ex)}: {ex}"
                )

        self.__vars[var_key] = {
            "description": var_description,
            "type": var_type,
            "value": value,
            "mandatory": is_mandatory,
            "default": default_value,
        }

    @staticmethod
    def get(var_key):
        return OSVars.instance().__get(var_key)

    def __get(self, var_key):
        if self.__should_print_usage is True:
            self.usage()
            sys.exit(1)
        elif self.__should_dump_config is True:
            self.dump()
            # this is a one time endeavor
            self.__should_dump_config = False

        if var_key not in self.__vars:
            raise Exception(
                f"{var_key} unknown. Please specify variable attributes using the register method in the process initialization(!)"
            )

        return self.__vars[var_key]["value"]

    def usage(self):
        mandatory_sign = {0: "", 1: "* "}

        print("\n\nEnvironment variables usage:\n")
        for (var_key, var_obj) in self.__vars.items():
            default = (
                f". (Default: {var_obj['default']})"
                if var_obj["default"] is not None
                else ""
            )
            print(
                f"{mandatory_sign[var_obj['mandatory']]}{var_key} ({var_obj['type'].__name__}): {var_obj['description']}{default}"
            )
        print(
            f"""
        * - mandatory vars
        {PRINT_CONFIG_USAGE_ENV_VAR}: set to any to produce this usage print
        {DUMP_CONFIG_ENV_VAR}: set to any to dump actual env vars values"""
        )

    def dump(self):
        print("\n\nEnvironment variables mem dump:\n")
        for (var_key, var_obj) in self.__vars.items():
            default = (
                f". (Default: {var_obj['default']})"
                if var_obj["default"] is not None
                else ""
            )
            print(
                f"{var_key}: {var_obj['value']} \n\t{var_obj['description']}{default}"
            )
