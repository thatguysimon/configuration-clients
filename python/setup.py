#!/usr/bin/env python

from setuptools import setup

# from setuptools import find_packages

setup(
    name="configuration_client",
    # packages=find_packages(exclude=["test*"]),
    packages=["configuration_client"],
    # py_modules="configuration_client",
    package_dir={"configuration_client": "."},
    # package_data={"configuration_client": ["config/*"]},
    # include_package_data=True,
    # data_files=[("config", ["config/file"])],
    description="environment aware configuration module for Twist modules",
    classifiers=["Private :: Do Not Upload to pypi server"],
    install_requires=["hvac", "requests"],
    version="0.0.5",
    url="git@github.com/twistbioscience/configuration-clients.git",
    author="Oren Sea",
    author_email="oren@prodops.io",
    keywords=["pip", "configuration", "twist", "packaging", "package"],
    zip_safe=False,
)
