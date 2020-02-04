require 'net/http'
require 'hjson'

require_relative 'abstract_env_config_loader'

#############################################################################
# GLOBALS and CONSTANTS                                                     #
#############################################################################

TWIST_GITHUB_ACCOUNT = 'Twistbioscience'
CONFIGURATION_REPO = 'configuration'
GIT_CONF_TOKEN_KEY = 'GIT_CONFIG_TOKEN'

#############################################################################
# IMPLEMENTATION                                                            #
#############################################################################

class GithubEnvConfigLoader < EnvConfigLoader
  def initialize(environment)
    super(environment)
    @__environment = environment
  end

  # concrete implementation for abstract method
  #
  # @return [list<String>]
  def list_categories
    __get_repo_file_list
  end

  # concrete implementation for abstract method
  #
  # @return [Hash] -- json parsed config
  def load(category)
    begin
      config_raw_content = __get_file_content("#{category}.json", @__environment)
      return Hjson.parse(config_raw_content)
    rescue StandardError => e
      puts "Failed loading and parsing config json content from branch/env #{@__environment}\nexception: #{e}"
    end
    {}
  end

  # helper function to fetching github token
  # either from ENV or from secrets
  #
  # @return [String]
  def self.__get_github_token
    github_conf_token = nil

    # first chance to env var...
    if !ENV[GIT_CONF_TOKEN_KEY].nil?
      github_conf_token = ENV[GIT_CONF_TOKEN_KEY]
    else
      # otherwise fetch from secrets
      common = Secrets.get('secret/common')
      puts "common is: #{common}"
      github_conf_token = common.fetch(:GIT_CONFIG_TOKEN)
    end

    if github_conf_token.nil?
      raise "Missing git configuration repo access token. See Vault::secret/common or set env var #{GIT_CONF_TOKEN_KEY}"
    end

    github_conf_token
  end

  # Pull the configuration file from the 'env' branch from git
  #
  # @return [String]
  def __get_file_content(file_path, branch_name)
    github_conf_token = GithubEnvConfigLoader.__get_github_token

    github_base_url = 'raw.githubusercontent.com'
    github_path = "/#{TWIST_GITHUB_ACCOUNT}/#{CONFIGURATION_REPO}/#{branch_name}/#{file_path.downcase}"

    headers = {
      'Accept-Encoding' => 'text',
      'Accept' => 'text/html',
      'Authorization' => "token #{github_conf_token}"
    }

    puts "Fetching #{file_path} from #{github_base_url}#{github_path} on branch/env #{branch_name}"

    net = Net::HTTP.new(github_base_url, 443)
    net.use_ssl = true
    # net.set_debug_output($stdout)
    response = net.get(github_path, headers)

    raise 'Could not authenticate and get configuration repo file using provided token' if response.code == '401'
    raise "Could not find configuration file #{file_path} in configuration repo in branch = #{@__environment}" \
    if response.code != '200'

    puts "remote file content(#{file_path}): #{response.body}"
    response.body
  end

  # fetch the list of .json (configuration) files from git branch 'env'
  # they are served to indicate the configuration categories.
  #
  # @return [list<String>] - uppercased names of categories (eg. ["SYSTEM", "GENES"...])
  def __get_repo_file_list
    github_conf_token = GithubEnvConfigLoader.__get_github_token

    # API reference: https://developer.github.com/v3/repos/contents/
    github_base_url = 'api.github.com'
    github_path = "/repos/#{TWIST_GITHUB_ACCOUNT}/#{CONFIGURATION_REPO}/contents/"

    headers = {
      'Accept-Encoding' => 'text',
      'Accept' => 'application/json',
      'Authorization' => "token #{github_conf_token}"
    }

    puts "Fetching file list from #{github_base_url}#{github_path} on branch/env #{@__environment}"

    uri = URI('https://' + github_base_url + github_path)
    params = { 'ref' => @__environment }
    uri.query = URI.encode_www_form(params)
    net = Net::HTTP.new(github_base_url, 443)
    net.use_ssl = true
    # net.set_debug_output($stdout)
    response = net.get(uri, headers)

    raise 'Could not authenticate and get configuration repo list using provided token' if response.code == '401'

    if response.code != '200'
      raise 'Could not find configuration branch at configuration repo with name = '\
        "#{@__environment} status code: #{response.code}"
    end

    files_json = Hjson.parse(response.body)
    json_suffix = '.json'

    # filter only file names that end with .json and that are not nested (only root level)
    files_json = files_json.select do |git_file|
      file_name = git_file['name']
      file_name.index(json_suffix, file_name.length - json_suffix.length) != nil && git_file['path'].index('/').nil?
    end
    # extract only the file names and transform to uppercase
    files_list = files_json.map do |git_file|
      git_file['name'].gsub(json_suffix, '').upcase
    end

    files_list
  end
end
