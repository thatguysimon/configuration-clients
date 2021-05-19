#!/usr/bin/env python

#############################################################################
# IMPORT MODULES                                                            #
#############################################################################
import unittest
from mock import patch, Mock
from src.secrets import Secrets
from src.os_vars import OSVars
from src.env_config import TWIST_ENV_KEY

from src.logger import Logger

Logger.instance = Mock()

ENV_NAME = "dummy_env_name"

MOCK_SECRET = {
    "key1": "val1",
    "envs": {
        "dummy_env_name": {
            "key1": "override"
        }
    }
}

#############################################################################
# IMPLEMENTATION                                                            #
#############################################################################


class SecretsTester(unittest.TestCase):

    testee = None

    @patch.dict("os.environ", {TWIST_ENV_KEY: ENV_NAME})
    def setUp(self):
        OSVars.get = Mock()
        OSVars.get.return_value = "dummy_env_name"
        self.testee = Secrets.instance()
        self.testee.connect = Mock()
        self.testee.get_by_path = Mock()
        self.testee.get_by_path.return_value = MOCK_SECRET
        self.testee.require_secret("test", "dummy_env_name")

    def test_dynamic_env_secret_override(self):

        expected = 'override'
        actual = self.testee.get("test")

        self.assertEqual(
            actual['key1'],
            expected,
            "expected get to return value of key1 which is overridden",
        )
