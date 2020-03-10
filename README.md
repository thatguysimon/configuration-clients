# configuration-clients
polyglot consumable configuration clients

This repo contains configuration clients written in all languages used in Twist.
They are to be consumed by all of Twists scripts, modules, packages and services.

It will also serve a Secrets wrapper as a standardized way to consume secrets.

# install examples

## Python
* ```pip install "git+https://github.com/Twistbioscience/configuration-clients.git@1.0.0#egg=configuration_client&subdirectory=python"```
* within requirements.txt place the following WITHOUT double quotes: 
```git+https://github.com/Twistbioscience/configuration-clients.git@1.0.0#egg=configuration_client&subdirectory=python```

  Few ways of controlling the consumed version.
  by tag (the "production" way should always refer the tag) using the tag name after the ".git@" (so the above consumes tag 1.0.0)
  by branch name (.git@branch_name_here)
  by commit hash (.git@commit_hash_here)
  
  there is an internal version number for the python configuration client pip package which might differ from the tag. please ignore it.

  See usage example in kitchen_sink.py in the python directory.

## Ruby
* Add the below to your Gemfile:
* ```gem 'configuration-client', git: 'https://github.com/Twistbioscience/configuration-clients.git',  tag: "1.0.0", glob: 'ruby/*.gemspec'```
* then run bundle install

  Few ways of controlling the consumed version.
  by tag (the "production" way should always refer the tag) using the tag argument
  by branch name using branch: 'branch_name_here'
  by commit hash using ref: 'commit_hash_here'


## Node
* Add the below to the "dependencies" section of your package.json file
* ```"configuration-client": "github:Twistbioscience/configuration-clients#1.0.0"```
* then run npm install

  Few ways of controlling the consumed version.
  by tag (the "production" way should always refer the tag) using the tag argument after the # sign
  by branch name using the branch name after the # sign
  by commit hash the hash after the # sign as well


## C#
* TBD


## Elixir
* TBD
