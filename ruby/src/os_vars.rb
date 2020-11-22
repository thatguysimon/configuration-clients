require 'singleton'
require_relative 'utils/type_utils.rb'

module TwistConf
  #############################################################################
  # GLOBALS and CONSTANTS                                                     #
  #############################################################################

  # supposedly, the only unregistered / declared env vars!
  DUMP_CONFIG_ENV_VAR = '__DUMP_CONFIG'
  PRINT_CONFIG_USAGE_ENV_VAR = '__CONFIG_USAGE'

  #############################################################################
  # IMPLEMENTATION                                                            #
  #############################################################################

  class OSVars
    include Singleton

    def initialize
      @__initialized = false

      # The registered vars mem db
      @__vars = {}
      # by default, when critical requirement is invalid then sys.exit except when dumping
      @__can_exit = (
          ENV[PRINT_CONFIG_USAGE_ENV_VAR].nil? &&
          ENV[DUMP_CONFIG_ENV_VAR].nil?)

      @__should_print_usage = !ENV[PRINT_CONFIG_USAGE_ENV_VAR].nil?
      @__should_dump_config = !ENV[DUMP_CONFIG_ENV_VAR].nil?
    end

    # validates all defined env vars to:
    # 1. exist in ENV if var is mandatory
    # 2. have provided value that adheres to defined type
    # Then it sets mem db (__vars) value to the actual (default or ENV provided)
    #
    # @return [void or throws]
    def __validate_and_set
      @__vars.each do |var_key, var_obj|
        # default case if the other conditions dont apply
        value = var_obj['default']

        if ENV[var_key].nil?
          if var_obj['is_mandatory'] == true
            __critical_fault("Missing mandatory os env var #{var_key} (#{var_obj['description']})")
          end
        else
          value = ENV[var_key]
        end

        # type checking and casting
        if var_obj['var_type'].name != 'String' && !value.nil?
          begin
            value = dynamic_cast(var_obj['var_type'], value)
          rescue StandardError => e
            __critical_fault("provided value for #{var_key} is expected to be #{var_obj['var_type']} but its not \n" \
              "Detailed exception:  #{e}")
          end
        end

        # finally
        var_obj['value'] = value
      end
    end

    # method that signs the registration - must be called post process initialization!
    #
    # @return [void or throws]
    def init
      __validate_and_set
      @__initialized = true
    end

    # helper method to std output error and exit (hence critical)
    #
    # @param message [String] - error message
    # @return - exits...
    def __critical_fault(message)
      puts "ENV VAR ERROR: #{message}"
      exit(1) unless @__can_exit == false
    end

    # helper static method for easier access (OSVars.register)
    def self.register(var_key, var_description, var_type = String, default_value = nil)
      OSVars.instance.__register(var_key, var_description, var_type, false, default_value)
    end

    # helper static method for easier access (OSVars.register_mandatory)
    def self.register_mandatory(var_key, var_description, var_type = String, default_value = nil)
      OSVars.instance.__register(var_key, var_description, var_type, true, default_value)
    end

    # os var registration / requirement method
    #
    # @param var_key [String] - name of env var
    # @param var_description [String] - elaborated purpose of this env within ones process
    # @param var_type [Class] - expected type for ENV value (will be validated converted!)
    # @param is_mandatory [bool] - if true, process will exit if var not found
    # default_value [String] - returned value for optional var that dont exist in ENV
    #
    # @return [void or throws]
    def __register(var_key, var_description, var_type = String, is_mandatory = false, default_value = nil)
      # sanity checks...
      unless @__vars[var_key].nil?
        puts "os var #{var_key} is already registered!"
      end

      # another sanity check...
      if !default_value.nil? && is_mandatory == true
        __critical_fault("defining var #{var_key} as mandatory with default value doesn't make sense!")
      end

      # the actual registration
      @__vars[var_key] = {
        'description' => var_description,
        'var_type' => var_type,
        # "value": value, # responsibility of __validate_and_set
        'is_mandatory' => is_mandatory,
        'default' => default_value
      }
    end

    # helper static method for easier access (OSVars.get)
    def self.get(var_key)
      OSVars.instance.__get(var_key)
    end

    # main os env var value accessor
    #
    # @param var_key [String] - name of os var name
    # @return [Class or throws or exit]
    #
    # side effect - only upon first time call - print usage or dump actual var + value list
    def __get(var_key)
      if @__should_print_usage == true
        usage
        exit(1)
      end
      if @__should_dump_config == true
        dump
        # this is a one time endeavor
        @__should_dump_config = false
      end

      # the below is not imperative when usage and dump are requested.
      if @__initialized == false
        raise 'OSVars has not been initialized. call OSVars.instance.init'
      end

      # all vars must be known in advance
      if @__vars[var_key].nil?
        raise "#{var_key} unknown. Please specify variable attributes using " \
        'the register method in the process initialization(!)'
      end

      # epilogue
      @__vars[var_key]['value']
    end

    # helper function to printing all process registered env vars, thier types, description and default value
    #
    # @return [void]
    def usage
      unless @__initialized
        raise 'OSVars has not been initialized. call OSVars.initialize()'
      end

      mandatory_sign = { false => '', true => '* ' }

      puts "\n\nEnvironment variables usage:\n\n"
      @__vars.each do |var_key, var_obj|
        default =
          if !var_obj['default'].nil?
            ". (Default: #{var_obj['default']})"
          else
            ''
          end
        puts "#{mandatory_sign[var_obj['is_mandatory']]}#{var_key} " \
        "(#{var_obj['var_type'].name}): #{var_obj['description']}#{default}"
      end
      # epilogue
      puts "\n* - mandatory vars\n" \
      "#{PRINT_CONFIG_USAGE_ENV_VAR}: set to any to produce this usage print\n" \
      "#{DUMP_CONFIG_ENV_VAR}: set to any to dump actual env vars values\n\n"
    end

    # helper function that dumps all the registered os vars and thier actual used values
    #
    # @return [void]
    def dump
      unless @__initialized
        raise 'OSVars has not been initialized. call OSVars.initialize()'
      end

      puts "\n\nEnvironment variables mem dump:\n\n"
      @__vars.each do |var_key, var_obj|
        default =
          if !var_obj['default'].nil?
            ". (Default: #{var_obj['default']})"
          else
            ''
          end
        puts "#{var_key}: #{var_obj['value']} \n\t#{var_obj['description']}#{default}"
      end
    end
  end
end

# see kitchen_sink.rb for better usage examples.
#
# OSVars.register("OREN", "my name", String, "kuku")
# OSVars.register_mandatory("SEA", "my fname", String)
# OSVars.instance.init
# puts "oren is #{OSVars.get("OREN")}"
