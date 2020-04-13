# put your github token in <your github token here> (around line 19)
# it should have read access to the configuration repo
#
# docker run -it -v `pwd`:/code bitwalker/alpine-elixir:1.7.4
# cd /code
# mix deps.get
# TWIST_ENV=dummy mix


defmodule KitchenSink.Application do
  use Application

  def start(_type, _args) do
    current_env = System.get_env("TWIST_ENV")

    IO.puts "in KitchenSink START! "
    IO.puts "env: #{current_env}"

    Application.put_env(:EnvConfig, :env_list, [current_env, "master"])
    Application.put_env(:EnvConfig, :github_token, "<your github token here>")

    EnvConfig.init()

    # first call, not storing returned value,
    # expects impl to fetch remote file
    EnvConfig.get("services")

    # second call, should return quick with vaule from cache
    svc = EnvConfig.get("services")
    IO.puts "rokey url: "
    IO.puts svc["ROCKY"]["URL"]

    # this should fail as no conf for "dummy-no"
    IO.puts "expecting the next call to throw..."
    no_val = EnvConfig.get("dummy-no")
    IO.puts "process will exit before reaching this line"

    children = [
    ]

    opts = [strategy: :one_for_one, name: KitchenSink.Supervisor]
    Supervisor.start_link(children, opts)
  end
  
end
