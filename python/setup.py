#!/usr/bin/env python

from setuptools import setup

setup(
    name="configuration_client",
    packages=["configuration_client"],
    package_dir={"configuration_client": "."},
    # package_data={"configuration_client": ["config/*"]},
    # include_package_data=True,
    # data_files=[("config", ["config/file"])],
    description="environment aware configuration module for Twist modules",
    classifiers=["Private :: Do Not Upload to pypi server"],
    install_requires=["mock", "hvac", "invoke", "bumpversion"],
    version="0.0.2",
    url="http://github.com/twistbioscience/configuration-clients",
    author="Oren Sea",
    author_email="oren@prodops.io",
    keywords=["pip", "configuration", "twist", "packaging", "package"],
)
