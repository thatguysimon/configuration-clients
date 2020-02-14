require 'yaml'
require_relative 'utils/logger'
require_relative 'os_vars'
require_relative 'env_config_loader_factory'
require_relative 'env_config'
require_relative 'secrets'

module TwistConf
  #############################################################################
  # GLOBALS and CONSTANTS                                                     #
  #############################################################################

  YAML_TYPE_TO_RUBY = {
    'String' => String,
    'Bool' => TrueClass,
    'Int' => Integer,
    'Float' => Float
  }

  #############################################################################
  # IMPLEMENTATION                                                            #
  #############################################################################

  class ConfigBuilder
    def __build_os_vars(data)
      if data['env-vars'].nil?
        return
      end

      data['env-vars'].each do |env_var_name, env_var_data|
        # puts "var name: #{env_var_name}, var data: #{env_var_data}"
        if env_var_data['is_mandatory'] == true
          OSVars.register_mandatory(
            env_var_name,
            env_var_data['description'],
            YAML_TYPE_TO_RUBY[env_var_data['type']]
          )
        else
          default_val = env_var_data['default']

          # registration expects string value (for when it comes from the real env as opposed to yaml)
          unless default_val.nil?
            default_val = default_val.to_s
          end

          OSVars.register(env_var_name, env_var_data['description'], YAML_TYPE_TO_RUBY[env_var_data['type']], default_val)
        end
      end
    end

    def __build_conf(data)
      if data['config'].nil?
        return
      end

      conf_data = data['config']
      conf_provider_name = conf_data['provider']
      factory = EnvConfigLoaderFactory.new
      conf_loader = factory.get_loader(conf_provider_name)

      if conf_data['parent_environments']
        EnvConfig.instance.set_env_fallback(conf_data['parent_environments'])
      end

      EnvConfig.instance.inject_loader(conf_loader)

      if conf_data['categories'].nil?
        return
      end

      conf_data['categories'].each do |category|
        EnvConfig.instance.require_category(category)
      end
    end

    def __build_secrets(data)
      if data['secrets'].nil?
        return
      end

      secrets_conf = data['secrets']

      return unless secrets_conf['required']

      secrets_conf['required'].each do |secret_key|
        # rubocop:disable Style/RedundantBegin
        begin
          Secrets.get(secret_key)
        rescue StandardError => e
          raise "Failed fetching Secrets key #{secret_key}. Error: #{e}"
        end
        # rubocop:enable Style/RedundantBegin
      end
    end

    def __build_logger(data)
      log_level = nil

      if data['logger']
        if data['logger']['level']
          log_level = data['logger']['level']
        end
        # not supported at the moment
        # if data['logger']['colored']
        #   colored = data['logger']['colored']
        # end
      end

      Log.instance.init(log_level)
    end

    def build(path_to_env_yaml = nil)
      actual_path = path_to_env_yaml
      if path_to_env_yaml.nil?
        actual_path = Dir.getwd + '/.envConfig.yml'
      end

      puts "Attempting to read env config yaml from #{actual_path}"
      env_file = File.open(actual_path)
      file_data = env_file.read
      env_file.close
      data = YAML.safe_load(file_data)

      # puts "yaml data is #{data}"

      __build_logger(data)

      __build_os_vars(data)
      OSVars.instance.init

      __build_secrets(data)

      __build_conf(data)
    end
  end
end
