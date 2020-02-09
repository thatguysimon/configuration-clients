#!/usr/bin/env python


#############################################################################
# HEADER                                                                    #
#############################################################################
"""
helper to generating a conf loader per strategy
"""

#############################################################################
# IMPORT MODULES                                                            #
#############################################################################


#############################################################################
# IMPLEMENTATION                                                            #
#############################################################################


class EnvConfigLoaderFactory:
    def get_loader(self):
        """
        The most naive and yet decoupled factory for config loader.
        In case someone changes the implementation to gitlab or something else,
        return the new implementation instance without affecting the rest of the code

        Returns:
            EnvConfLoader concrete instance -- the sought after loader
        """
        from .github_env_conf_loader import GithubEnvConfigLoader

        return GithubEnvConfigLoader()
