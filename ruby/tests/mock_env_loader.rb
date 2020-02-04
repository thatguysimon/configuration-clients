require_relative '../src/abstract_env_config_loader'


# Config environment aware config loader - mock.
# Implements EnvConfigLoader in order to be injected into EnvConfig
class GithubMockEnvConfig < EnvConfigLoader
  def initialize(environment)
    super(environment)
  end

  def mock_set_categories(categories)
    @__categories = categories
  end

  def mock_set_data(data)
    @__data = data
  end

  def list_categories
    return @__categories
  end
  
  def load(category)
    begin
      return @__data[category.upcase]
    rescue StandardError => e
      puts "Failed loading and parsing config json content from branch/env '{@__environment}'\nexception: #{ex}"
    end
    
    return {}
  end
end
