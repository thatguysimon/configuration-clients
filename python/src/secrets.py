#!/usr/bin/env python

#############################################################################
# HEADER                                                                    #
#############################################################################
"""
encapsulation to secret management api using Vault
"""

#############################################################################
# IMPORT MODULES                                                            #
#############################################################################
import os
import hvac

VAULT_URL_KEY = "VAULT_URL"
VAULT_DEFAULT_URL = "https://vault.twistbioscience-staging.com"
VAULT_USER_KEY = "VAULT_USER"
VAULT_PASS_KEY = "VAULT_PASSWORD"

#############################################################################
# IMPLEMENTATION                                                            #
#############################################################################


class Secrets:
    """
    The Secret Management class serving application with credentials, keys and other secretive
    information that should not reside within the concealed configuration or environment variables.
    This is a read only implementation that can support dynamic environments, seperating dev, qa and staging
    secrets from production ones.

    Class Public Interface:

        connect
        get (already ensures call to connect)

    TODO: mem-encrypt cached elements for enhanced security
    TODO: add backward compatibility to old env secrets (qa | dev | staging)

    """

    __instance = None

    @staticmethod
    def instance():
        """ Static access method. """
        if Secrets.__instance is None:
            # the only place the Secrets constructor is being called.
            Secrets()
        return Secrets.__instance

    def __init__(self):
        if Secrets.__instance is None:
            Secrets.__instance = self
        else:
            # should anyone call Secrets directly, make a bold statement about it.
            raise Exception(
                """Secrets object already initialized - you cannot create another instance!
                (hint: use Secrets.instance()"""
            )
        # The vault client
        self.__client = None
        self.__cache = {}

    def connect(self):
        if self.__client is not None:
            return True

        vault_url = VAULT_DEFAULT_URL

        if VAULT_URL_KEY in os.environ:
            vault_url = os.environ[VAULT_URL_KEY]

        print(f"connecting to vault on: {vault_url}")

        if VAULT_USER_KEY not in os.environ:
            raise Exception(f"missing {VAULT_USER_KEY} in env")

        if VAULT_PASS_KEY not in os.environ:
            raise Exception(f"missing {VAULT_PASS_KEY} in env")

        vault_user = os.environ[VAULT_USER_KEY]
        vault_pass = os.environ[VAULT_PASS_KEY]

        try:
            self.__client = hvac.Client(url=vault_url, timeout=30)
            self.__client.auth_userpass(vault_user, vault_pass)
        except Exception as ex:
            print(f"Failed connecting to vault. error: {ex}")
            return False

        print(f"connected to vault on {vault_url}")
        return True

    @staticmethod
    def get(path_to_secret):
        """
        Get the secret associated with the the provided key.
        Ex. Secrets.get("secret/common") for common secrets in vault

        Arguments:
            path {str} -- path to secret in vault

        Raises:
            Exception: if SM not connected
            Exception: if SM key isn't found

        Returns:
            [dict] -- the secret
        """
        # ensures connection
        Secrets.instance().connect()
        return Secrets.instance().__get(path_to_secret)

    def __get(self, path):
        """
        Get the secret associated with the the provided key.
        Ex. Secrets.get("secret/common") for common secrets in vault

        Arguments:
            path {str} -- path to secret in vault

        Raises:
            Exception: if SM not connected
            Exception: if SM key isn't found

        Returns:
            [dict] -- the secret
        """

        # try to hit cache first
        if path in self.__cache:
            return self.__cache[path]

        # else read remote
        if self.__client is None:
            raise Exception(
                """not connected to Secret-Management server.
                   Make sure to call connect first
                """
            )

        secret = self.__client.read(path)
        # using vault v2 the below is the new way to fetch a secret
        # secret = self.__client.secrets.kv.v2.read_secret_version(path)
        if secret is None or "data" not in secret:
            err = "Failed to read secret"
            print(err)
            raise Exception(err)

        self.__cache[path] = secret["data"]
        return secret["data"]
