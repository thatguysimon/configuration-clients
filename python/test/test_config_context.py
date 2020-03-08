#!/usr/bin/env python

#############################################################################
# IMPORT MODULES                                                            #
#############################################################################
import unittest
import copy
from mock import Mock
from src.config_context_handler import EnvConfigContext
from src.config_context_handler import CONTEXT_DECLARATION_KEY
from src.config_context_handler import validate_no_template_left

from src.logger import Logger

Logger.instance = Mock()

MOCK_CONF_NO_CONTEXT = {"mitzi": " miao "}
MOCK_CONF_WITH_CONTEXT_REF = {"mitzi": " {{ miao }} "}
MOCK_CONF_NO_CONTEXT_REF = {
    CONTEXT_DECLARATION_KEY: {"x": 1},
    **MOCK_CONF_NO_CONTEXT,
}
MOCK_CONF = {
    CONTEXT_DECLARATION_KEY: {
        "staging": {"test_str": "__val__", "test_int": 1974},
        "russian": {"thanks": "spasibo!"},
        "hebrew": {"thanks": "toda!"},
    },
    "data": {
        "str": "{{ test_str }}",
        "mixed_str": "ABCD{{    test_str}}ABCD",
        "int": "{{test_int}}",
        "thanks": "{{thanks}}",
    },
}
#############################################################################
# IMPLEMENTATION                                                            #
#############################################################################


class EnvConfigContextTester(unittest.TestCase):
    def test_no_context_in_conf_yields_original_data(self):
        testee = EnvConfigContext("dummy_env_name")
        testee.add("mitzi", "woofwoof")

        actual = testee.process(MOCK_CONF_NO_CONTEXT)
        expected = copy.deepcopy(MOCK_CONF_NO_CONTEXT)

        self.assertEqual(
            actual,
            expected,
            "expected to get the original provided json which was without context but got something else ",
        )

    def test_context_without_ref_in_conf_yields_original_data(self):
        testee = EnvConfigContext("dummy_env_name")
        testee.add("mitzi", "woofwoof")

        actual = testee.process(MOCK_CONF_NO_CONTEXT_REF)
        expected = copy.deepcopy(MOCK_CONF_NO_CONTEXT_REF)
        del expected[CONTEXT_DECLARATION_KEY]

        self.assertEqual(
            actual,
            expected,
            "expected to get the original provided json which was without context but got something else ",
        )

    def test_context_and_data_yield_modified_version(self):
        testee = EnvConfigContext("staging")
        testee.add("language", "russian")

        actual = testee.process(MOCK_CONF)
        expected = copy.deepcopy(MOCK_CONF)
        del expected[CONTEXT_DECLARATION_KEY]

        expected["data"] = {
            "str": "__val__",
            "mixed_str": "ABCD__val__ABCD",
            "int": 1974,
            "thanks": "spasibo!",
        }

        self.assertEqual(
            actual,
            expected,
            "expected to get the original provided json which was without context but got something else ",
        )

        testee = EnvConfigContext("staging")
        testee.add("language", "hebrew")

        actual = testee.process(MOCK_CONF)
        expected = copy.deepcopy(MOCK_CONF)
        del expected[CONTEXT_DECLARATION_KEY]

        expected["data"] = {
            "str": "__val__",
            "mixed_str": "ABCD__val__ABCD",
            "int": 1974,
            "thanks": "toda!",
        }

        self.assertEqual(
            actual,
            expected,
            "expected to get the original provided json which was without context but got something else ",
        )

    def test_validation_that_when_finds_template_it_raises_exception(self):
        actual = None
        try:
            testee = {"dummy": "asdfadsfasd {{ aaa     }}sdsdfsd"}
            actual = validate_no_template_left(testee)
        except Exception:
            pass

        self.assertIsNone(actual, "expected test raise exception but it did not")

        try:
            testee = {"dummy": "{{aaa}}"}
            actual = validate_no_template_left(testee)
        except Exception:
            pass

        self.assertIsNone(actual, "expected test raise exception but it did not")

        try:
            testee = {"dummy": "{{a_a-A.y}}"}
            actual = validate_no_template_left(testee)
        except Exception:
            pass

        self.assertIsNone(actual, "expected test raise exception but it did not")

    def test_validation_that_when_no_template_found_it_returns_false(self):
        testee = {"dummy": "asdfadsfasd { aaa     }}sdsdfsd"}
        actual = validate_no_template_left(testee)

        self.assertFalse(actual, "expected test not to find a template but it did!!")

        testee = {"dummy": "{aaa}"}
        actual = validate_no_template_left(testee)

        self.assertFalse(actual, "expected test not to find a template but it did!!")

        testee = {"dummy": "{ { {a_a-A}}}"}
        actual = validate_no_template_left(testee)

        self.assertFalse(actual, "expected test not to find a template but it did!!")

        testee = {"dummy": "{ {a_a-A} }"}
        actual = validate_no_template_left(testee)

        self.assertFalse(actual, "expected test not to find a template but it did!!")
