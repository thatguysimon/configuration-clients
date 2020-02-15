Gem::Specification.new do |s|
  s.name        = 'configuration-client'
  s.version     = '0.0.914'
  s.date        = '2020-02-14'
  s.summary     = "Twist ruby configuration client"
  s.description = "A configuration client for ruby based Twist services" 
  s.authors     = ["Oren Sea"]
  s.email       = 'osea@twistbioscience.com'
  s.require_paths = ["src"]
  # s.rubygems_version = "2.6.3"
  s.files       = [
    "src/env_config.rb", 
    "src/config_builder.rb", 
    "src/abstract_env_config_loader.rb", 
    "src/env_config_loader_factory.rb", 
    "src/github_env_conf_loader.rb", 
    "src/os_vars.rb", 
    "src/secrets.rb",
    "src/utils/logger.rb",
    "src/utils/type_utils.rb",
    "Gemfile",
    "Gemfile.lock",
    "Rakefile"
  ]
  s.homepage    = 'https://github.com/Twistbioscience/configuration-clients'
  s.license       = 'PRIVATE'
  s.add_runtime_dependency 'abstraction', '~>0.0.4'
  s.add_runtime_dependency 'hjson', '~>0.1.2'
  s.add_runtime_dependency 'vault', '~> 0.10.1'
  s.add_development_dependency 'abstraction', '~>0.0.4'
  s.add_development_dependency 'hjson', '~>0.1.2'
  s.add_development_dependency 'vault', '~> 0.10.1'
end