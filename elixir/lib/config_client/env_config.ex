# config cache store
defmodule EnvConfigCache do
end

defmodule EnvConfig do
  use Application
  
  def get(category) do
    __get(category)
  end

  def __get_github_token() do
    Application.get_env(:EnvConfig, :github_token)
  end

  def init() do
    # determining active env config branch
    Application.get_env(:EnvConfig, :env_list) |> Enum.each(fn(e) -> 
      if __is_branch_valid(e) do
        Application.put_env(:EnvConfig, :active_env, e)
      end
    end
    )

    env = Application.get_env(:EnvConfig, :active_env)
    IO.puts "Active config branch: #{env}"
  end

  def __is_branch_valid(branch) do
    HTTPoison.start
    url = "https://api.github.com/repos/Twistbioscience/configuration/branches/#{branch}"
    token = __get_github_token()
    headers = ["Authorization": "token #{token}", "Accept": "Application/json; Charset=utf-8", "Accept-Encoding": "gzip, deflate"]

    case HTTPoison.get(url, headers) do
      {:ok, %HTTPoison.Response{status_code: 200}} ->
        true
      {:ok, %HTTPoison.Response{status_code: 404}} ->
        IO.puts "Branch #{branch} not found. Trying next..."
        false
      {:error, %HTTPoison.Error{reason: reason}} ->
        IO.inspect reason
    end
  end

  def __get(category) do
    IO.puts "get called with #{category}"
    cache = Application.get_env(:EnvConfigCache, category)

    if cache do
      cache
    else
      data = __get_file_content(String.downcase(category) <> ".json")
      {:ok, data} = JSON.decode(data)
      Application.put_env(:EnvConfigCache, category, data)
      data
    end
  end

  def __get_file_content(file_path) do
    branch_name = Application.get_env(:EnvConfig, :active_env)

    HTTPoison.start
    url = "https://raw.githubusercontent.com/Twistbioscience/configuration/#{branch_name}/#{file_path}"
    IO.puts "getting file content from #{url}"
    token = __get_github_token()
    headers = ["Authorization": "token #{token}", "Accept": "*/*", "Accept-Encoding": "gzip, deflate"]

    case HTTPoison.get(url, headers) do
      {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
        body = :zlib.gunzip(body)
        # IO.puts "after unzip: #{body}"
        # body
        # # |> Poison.decode!
        # # |> Map.take(@expected_fields)
        # |> Enum.map(fn({k, v}) -> {String.to_atom(k), v} end)
        body = Json5Reader.to_json(body)
        # body = JSON.decode(body)
        # IO.puts body
        body
      {:ok, %HTTPoison.Response{status_code: 404}} ->
        IO.puts "Not found :("
      {:error, %HTTPoison.Error{reason: reason}} ->
        IO.inspect reason
    end
  end

end
