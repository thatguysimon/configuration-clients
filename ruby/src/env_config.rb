require 'singleton'
require 'set'
require_relative 'os_vars'
require_relative 'env_config_loader_factory'

#############################################################################
# GLOBALS and CONSTANTS                                                     #
#############################################################################
TWIST_ENV_KEY = 'TWIST_ENV'

#############################################################################
# IMPLEMENTATION                                                            #
#############################################################################

OSVars.register_mandatory(TWIST_ENV_KEY, 'Running environment var for twist modules', String)

class EnvConfig
  include Singleton

  def initialize
    @__env = OSVars.get(TWIST_ENV_KEY)
    @__config = {}
    @__config_loader = nil
    # the below is a Set - helper to hold collection of listed (yet not loaded) categories.
    @__config_categories = Set['___dummyKey__']
  end

  # Dependency injection of a config loader that adheres to the EnvConfigLoader interface
  #
  # @param config_loader [EnvConfigLoader] -- the concrete configuration loader
  # @return [void]
  def inject_loader(config_loader = nil)
    # has anyone provided his loader implementation, use it, otherwise the factory will do.
    if config_loader.nil?
      config_loader = EnvConfigLoaderFactory.new.get_loader(@__env)
    end

    @__config_loader = config_loader
    # for the first time, query all environment existing categories.
    __load_categories
  end

  # using injected config loader to get a hold of the data
  #
  # @param category [String] - name of category file to load config from
  # @return [void]
  def __load_config(category)
    if @__config_loader.nil?
      raise 'Cannot load config without a loader (implementing EnvConfigLoader). please set loader respectively'
    end

    begin
      @__config_loader.load(category)
    rescue StandardError => e
      puts "Failed loading config for provided environment #{@__env}. Exception: #{e}"
    end
  end

  def __load_categories
    categories = @__config_loader.list_categories
    categories.each do |category|
      normalized_category = category.gsub('.json', '').upcase
      __load_configuration_category(normalized_category)
    end
  end

  def __load_configuration_category(category_name)
    # _dynamic_get_func = EnvConfig.__generate_get_function(category_name)
    # create a dynamic method based on loaded category name
    # setattr(EnvConfig, category_name, _dynamic_get_func)
    # make the above added method as static so one can call also directly (eg. EnvConf.SYSTEM)
    # setattr(
    #     EnvConfig,
    #     category_name,
    #     staticmethod(getattr(EnvConfig.instance(), category_name)),
    # )

    # add the new category to the set so we know it exists
    @__config_categories.add(category_name)
    puts "Configuration category #{category_name} listed"
  end

  # helper static function for easier access (EnvConfig.get)
  def self.get(category, section = nil, key = nil, default_value = nil)
    EnvConfig.instance.__get(category, section, key, default_value)
  end

  # main config accessor function
  #
  # @param category [String] - category name (in actuality the config json file name w/o suffix and uppercased)
  # @param section [String] - name of section within the configuration Hash (json)
  # @param key [String] - name of key within section
  # @param default_value [any] - value to return when above references to config (section + key) isnt found
  #
  # @return [any] default or actual value (can be any primitive type or a Hash representing the whole config json)
  def __get(category, section = nil, key = nil, default_value = nil)
    # detecting the first access ever to this instance,
    # it requires that we set a loader and initialize current environment configuration section (json files)
    if @__config_loader.nil?
      inject_loader
    end

    # category is being accessed for the first time, load it
    if @__config[category].nil?
      @__config[category] = __load_config(category)
    end

    # someone wants to get a hold of the entire category config
    if section.nil?
      return @__config[category]
    end

    # someone wants to get a hold of an entire section structure
    if !section.nil? && key.nil? && !@__config[category][section].nil?
      return @__config[category][section]
    end

    # missing section
    if @__config[category][section].nil?
      return default_value
    end

    # missing key in section
    if @__config[category][section][key].nil?
      return default_value
    end

    # actual config indicated data
    @__config[category][section][key]
  end
end
