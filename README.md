# configuration-clients
polyglot consumable configuration clients

This repo contains configuration clients written in all languages used in Twist.
They are to be consumed by all of Twists scripts, modules, packages and services.

It will also serve a Secrets wrapper as a standardized way to consume secrets.

# install examples

## Python
* ```pip install "git+https://github.com/Twistbioscience/configuration-clients.git@master#egg=configuration_client&subdirectory=python"```
* within requirements.txt place the following WITHOUT double quotes: 
git+https://github.com/Twistbioscience/configuration-clients.git@master#egg=configuration_client&subdirectory=python
  
  The @master part controls the branch from which to install. Should ALWAYS refer to the releasable master unless you're experimenting.

  See usage example in kitchen_sink.py in the python directory.

## Ruby
* Add the below to your Gemfile:
* ```gem 'configuration-client', git: 'https://github.com/Twistbioscience/configuration-clients.git', branch: 'master', glob: 'ruby/*.gemspec'```


## Node
* TBD


## C#
* TBD


## Elixir
* TBD
