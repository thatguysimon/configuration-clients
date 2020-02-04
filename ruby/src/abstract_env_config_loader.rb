# abstract class to all env config loaders
class EnvConfigLoader
  def initialize(environment)
    @environment = environment
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
