require_relative 'src/os_vars.rb'
require_relative 'src/secrets.rb'
require_relative 'src/env_config.rb'
require_relative 'src/config_builder.rb'
require_relative 'src/utils/logger'

include TwistConf

config_context = { 'language' => 'hebrew' }
ConfigBuilder.new(config_context).build('../.envConfig.yml')

#############################################################################
# USAGE                                                                     #
#############################################################################

#
# In order to test-run this kitchen sink:

# > cd ruby
# > bundle install

# the below is a happy path...
# - VAULT_USER=<vault user> VAULT_PASSWORD=<vault pass> TWIST_ENV=kitchen-sink-demo-do-not-delete ruby kitchen_sink.rb

# omit "VAULT_USER" in order to yield the mandatory-missing var. Pay attention it will sys.EXIT!
# add "__CONFIG_USAGE=1" in order to view required/dependable list of env vars
# add "__DUMP_CONFIG=1" in order to dump the actual env var values.

#############################################################################
# OS / ENVIRONMENT VARS                                                     #
#############################################################################

v = OSVars.get('COMPANY')
Log.info("Company name provided by os env is: #{v} and its type is: #{v.class}")

#############################################################################
# ENV CONFIGURATION (using github)                                          #
#############################################################################

# visit https://github.com/Twistbioscience/configuration/tree/kitchen-sink-demo-do-not-delete
# in order to examine concrete values involved in this example.

# attempting to read the "all" section from the system.json conf file in the configuration repo
v = EnvConfig.get('SYSTEM', 'all', nil)
Log.info("got #{v} from system conf [all] section...\n")

# attempting to read the all.some_demo_key value from the system.json conf file in the configuration repo
v = EnvConfig.get('SYSTEM', 'all', 'some_demo_key')
Log.info("got #{v} from system conf [all.some_demo_key]...\n")

# attempting to read a non existing config from the global.json conf file in the configuration repo
v = EnvConfig.get(
  'global',
  'non_existing_section',
  'non_existing_key',
  ['this is a default value as a single list element']
)
Log.info("got #{v} from system conf global section...\n")

service_x_data = EnvConfig.get('CONTEXT_TEST', 'MISC', 'SERVICE_X')
Log.info("Connecting to http://#{service_x_data['HOST']}:#{service_x_data['PORT']}...")

v = EnvConfig.get('CONTEXT_TEST', 'MISC', 'TRANSLATED_THANKS')
Log.info("translated text: #{v}")

#############################################################################
# READING SECRETS                                                           #
#############################################################################

# reading the common secret
v = Secrets.get('common')
Log.info("got #{v} from vault common...it hit the cache because EnvConfig has already accessed common for git token\n")

# reading the common secret again (it hits the cache as the stdout print suggests)
v = Secrets.get('common')
Log.info("got #{v} from vault common...the cached value again...\n\n")

# attempting to read dummy from the dummy.json conf file that is not in existence
# in the conf repo - this should fail
EnvConfig.get('DUMMY', 'dummy', 'some_dummy_key')
