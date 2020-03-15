import os

PRODUCTION_BRANCH_NAME = "master"
ENV_VAR_NAME = "TWIST_ENV"


def is_production():
    return os.environ[ENV_VAR_NAME] == PRODUCTION_BRANCH_NAME
