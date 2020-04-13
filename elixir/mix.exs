defmodule ConfigClients.Mixfile do
  use Mix.Project

  def project do
    [
      app: :ConfigClients,
      version: "0.1.1",
      elixir: "~> 1.7",
      elixirc_paths: elixirc_paths(Mix.env()),
      compilers: [:gettext] ++ Mix.compilers(),
      # start_permanent: Mix.env() == :prod,
      aliases: aliases(),
      deps: deps(),
      test_coverage: [tool: ExCoveralls],
      preferred_cli_env: [
        coveralls: :test,
        "coveralls.demo": :demo,
      ]
    ]
  end

  def application do
    [
      mod: {KitchenSink.Application, []},
      extra_applications: [:logger, :runtime_tools, :inets, :httpoison, :json]
    ]
  end

  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(:dev), do: ["lib", "test/support"]
  defp elixirc_paths(_), do: ["lib"]

  defp deps do
    [
      {:gettext, "~> 0.11"},
      {:json, "~> 1.2"},
      {:distillery, "~> 2.0.3", runtime: false},
      {:ex_doc, "~> 0.18.2", only: :dev},
      {:credo, "~> 0.10.0", only: [:dev, :test], runtime: false},
      {:httpoison, "~> 1.6.2"},
    ]
  end

  defp aliases do
    [
      test: ["ecto.create --quiet", "ecto.migrate", "test"]
    ]
  end

  defp description do
    """
    Library for configuration management
    """
  end

  defp package do
    [
      files: ["lib", "mix.exs", "README*", "LICENSE*"],
      maintainers: ["Oren Sea"],
      licenses: ["MIT"],
      links: %{"GitHub" => "https://github.com/Twistbioscience/configuration-clients"}
    ]
  end

end
