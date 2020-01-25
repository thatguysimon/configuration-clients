import GithubEnvConfigLoader from './GithubEnvConfigLoader'

export default class EnvConfigLoaderFactory {
  public getLoader(env: string) {
    return new GithubEnvConfigLoader(env)
  }
}