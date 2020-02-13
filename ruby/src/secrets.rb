require 'singleton'
require 'vault'
require_relative 'os_vars'
require_relative 'utils/logger'

#############################################################################
# GLOBALS and CONSTANTS                                                     #
#############################################################################

# TODO: move to a common folder within the config clients monorepo
VAULT_API_VERSION = 'v1'
VAULT_URL_KEY = 'VAULT_URL'
VAULT_DEFAULT_URL = 'https://vault.twistbioscience-staging.com'
VAULT_USER_KEY = 'VAULT_USER'
VAULT_PASS_KEY = 'VAULT_PASSWORD'

#############################################################################
# IMPLEMENTATION                                                            #
#############################################################################

OSVars.register_mandatory(VAULT_USER_KEY, 'Vault secret management user name', String)
OSVars.register_mandatory(VAULT_PASS_KEY, 'Vault secret management password', String)
OSVars.register(VAULT_URL_KEY, 'Vault secret management server', String, VAULT_DEFAULT_URL)

class Secrets
  include Singleton

  def initialize
    @__logged_in = false
    @__secrets = {}
    @__vault = nil
  end

  # login to vault secret management server
  #
  # @return [void or throws]
  def login
    if @__logged_in
      return true
    end

    vault_url = OSVars.get(VAULT_URL_KEY)
    Log.info("connecting to vault via #{vault_url}")

    begin
      # TODO: might need to provide interface to services insisting on configuring vault client
      # Vault.configure do |config|
      #   config.timeout = 30
      #   config.ssl_timeout  = 5
      #   config.open_timeout = 5
      #   config.read_timeout = 30
      # end
      Vault.address = vault_url
      v_user = OSVars.get(VAULT_USER_KEY)
      v_pass = OSVars.get(VAULT_PASS_KEY)
      Vault.auth.userpass(v_user, v_pass)

      @__logged_in = true
    rescue StandardError => e
      raise "Failed connecting to vault on #{vault_url} error details: #{e}"
    end
  end

  # helper static method for easier access (Secrets.get) without calling login
  def self.get(path_to_secret)
    Secrets.instance.login
    Secrets.instance.__get(path_to_secret)
  end

  # Main secret accessor. Uses internal cache (naive)
  #
  # @param path_to_secret [String]
  # @return [Hash or throws]
  def __get(path_to_secret)
    unless @__logged_in
      raise 'not connected to Secret-Management server.' \
             'Make sure to call connect first'
    end

    # try to hit cache first
    if @__secrets[path_to_secret]
      return @__secrets[path_to_secret]
    end

    # or read remote
    Vault.with_retries(Vault::HTTPConnectionError, Vault::HTTPError) do |attempt, e|
      # Note: Using puts since Rails logger won't yet be initialized
      raise "Failed fetching secret #{path_to_secret} from Vault. exception #{e} - attempt #{attempt}" if e

      secret_hash = Vault.logical.read(path_to_secret).data
      @__secrets[path_to_secret] = secret_hash
    end
    @__secrets[path_to_secret]
  end
end

# see kitchen_sink.rb for better usage examples.
#
# OSVars.instance.init
# Secrets.instance.login
# sec = Secrets.get("secret/common")
# puts "common secret is... #{sec}"
