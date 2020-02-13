#!/usr/bin/env python

from setuptools import setup


setup(
    name="configuration_client",
    packages=["configuration_client"],
    package_dir={"configuration_client": "./src"},
    package_data={"configuration_client": ["src/*"]},
    description="environment aware configuration module for Twist modules",
    classifiers=["Private :: Do Not Upload to pypi server"],
    install_requires=["hvac", "requests", "json5", "termcolor", "PyYAML"],
    version="0.0.17",
    url="git@github.com/twistbioscience/configuration-clients.git",
    author="Oren Sea",
    author_email="oren@prodops.io",
    keywords=["pip", "configuration", "twist", "packaging", "package"],
    zip_safe=False,
    include_package_data=True,
    python_requires=">=3.6",
)
