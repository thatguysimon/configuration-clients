require_relative './github_env_conf_loader.rb'

LOADERS_MAP = {
  'github' => GithubEnvConfigLoader,
  'default' => GithubEnvConfigLoader
}

class EnvConfigLoaderFactory
  # """
  # The most naive and yet decoupled factory for config loader.
  # In case someone changes the implementation to gitlab or something else,
  # return the new implementation instance without affecting the rest of the code
  #
  # @return [EnvConfLoader] concrete instance -- the sought after loader
  def get_loader(loader_name = nil)
    loader = LOADERS_MAP['default']

    unless loader_name.nil?
      loader = LOADERS_MAP[loader_name]
    end

    loader.new
  end
end
