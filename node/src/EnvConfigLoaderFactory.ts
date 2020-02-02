import GithubEnvConfigLoader from './GithubEnvConfigLoader';

/**
 * Config loader factory.
 * Should one decide working with config that is different than github, a proper concrete impl should be provided,
 * the getLoader method should return an instance to the alternative loader (maybe gitlab or something else)
 * In case this library will provide multiple options, the instantiation should be made dynamically from config (env, arg)
 */
export default class EnvConfigLoaderFactory {
    public getLoader(env: string) {
        return new GithubEnvConfigLoader(env);
    }
}
