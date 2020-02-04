require_relative './github_env_conf_loader.rb'

class EnvConfigLoaderFactory
  # """
  # The most naive and yet decoupled factory for config loader.
  # In case someone changes the implementation to gitlab or something else,
  # return the new implementation instance without affecting the rest of the code
  #
  # @param environment [string] -- environment from which the loader pulls the config
  #
  # @return [EnvConfLoader] concrete instance -- the sought after loader
  def get_loader(environment)
    GithubEnvConfigLoader.new(environment)
  end
end
