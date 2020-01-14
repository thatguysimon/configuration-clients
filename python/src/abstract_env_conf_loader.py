#!/usr/bin/env python


#############################################################################
# HEADER                                                                    #
#############################################################################
"""
    Abstract base class for all EnvConfigLoaders...
"""

#############################################################################
# IMPORT MODULES                                                            #
#############################################################################

from abc import ABC, abstractmethod

#############################################################################
# IMPLEMENTATION                                                            #
#############################################################################


class EnvConfigLoader(ABC):
    """
      A base class for any environment aware config loader.
      To be injected into EnvConfig (see EnvConfig::load_config)
    """

    def __init__(self, environment):
        super().__init__()
        self._env = environment

    @abstractmethod
    def load(self):
        """
          Performs the actual configuration reading (from whatever source concrete impl represents)

          Returns: dict (json)
        """
        pass

    @abstractmethod
    def list_categories(self):
        pass
