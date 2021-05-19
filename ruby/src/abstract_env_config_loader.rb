# abstract class to all env config loaders
class EnvConfigLoader
  def set_env(environment, fallback_list)
    @environment = environment
    @fallback_list = fallback_list
    verify_env_or_fallback
  end

  def set_version(version)
    @version = version
  end

  # expected to verify existence and validity of @env and fallback to other env in list
  def verify_env_or_fallback
    raise NotImplementedError
  end

  # expected to return the Hash representation of a given category (eg. config .json file)
  def load
    raise NotImplementedError
  end

  # expected to return a list of strings representing the different categories found
  # in the configuration medium.
  def list_categories
    raise NotImplementedError
  end
end
