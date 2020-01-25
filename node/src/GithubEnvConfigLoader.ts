import IEnvConfigLoader from './IEnvConfigLoader'
import axios from 'axios'
import JSON5 from 'json5'

const TWIST_GITHUB_ACCOUNT = "Twistbioscience"
const CONFIGURATION_REPO = "configuration"
// const GIT_CONF_TOKEN_KEY = "GIT_CONFIG_TOKEN"

export default class GithubEnvConfigLoader implements IEnvConfigLoader {
  private environment: string;

  constructor(env: string) {
    this.environment = env;
  }

  public async load(category: string): Promise<any> {
    try {
      const raw = await this.getFileContent(`${category}.json`, this.environment)
      console.log("RAW DATA: " + JSON.stringify(raw))

      if (typeof (raw) === 'object') {
        return raw;
      }

      return JSON5.parse(raw)
    } catch (ex) {
      console.log(`Failed loading and parsing config json content from branch/env "${this.environment}"\nexception: ${ex}`)
    }

    return {}
  }

  public async listCategories(): Promise<Array<string>> {
    return this.getRepoFileList();
  }

  private static getGithubToken(): string {
    return "";
    // let githubToken;

    // // first chance to env var...
    // if (process.env[GIT_CONF_TOKEN_KEY]) {
    //   githubToken = process.env[GIT_CONF_TOKEN_KEY]
    // }
    // else {
    //   // otherwise fetch from secrets
    //   const common = Secrets.get("secret/common")
    //   githubToken = common[GIT_CONF_TOKEN_KEY]
    // }

    // if (githubToken === undefined || githubToken.trim() === "") {
    //   throw new Error(
    //     `Missing git configuration repo access token. See Vault::secret/common or set env var ${GIT_CONF_TOKEN_KEY}`
    //   )
    // }

    // return githubToken
  }

  private async getRepoFileList(): Promise<Array<string>> {
    const githubToken = GithubEnvConfigLoader.getGithubToken();

    //  API reference: https://developer.github.com/v3/repos/contents/
    const githubApiURL = `https://api.github.com/repos/${TWIST_GITHUB_ACCOUNT}/${CONFIGURATION_REPO}/contents/?ref=${this.environment}`

    const headers = {
      "Accept-Encoding": "gzip, deflate",
      "Accept": "application/json",
      "Authorization": `token ${githubToken}`,
    }

    console.log(`Fetching file list from ${githubApiURL} on branch/env "${this.environment}"`)

    let res;
    try {
      res = await axios.get(githubApiURL, { headers })
    } catch (ex) {
      throw new Error(`Failed fetching ${githubApiURL}. Ex: ${ex}`)
    }

    // console.log(`AXIOS RESP: ${JSON.stringify(res?.data)}`)

    if (!res.data || res.data.length === 0) {
      throw new Error(`configuration repo at branch ${this.environment} is empty!`)
    }

    return res.data.filter((e: any) => e.name.endsWith('.json') && e.path.indexOf('/') === -1)
      .map((e: any) => e.name.replace(".json", "").toUpperCase())
  }

  private async getFileContent(filePath: string, branchName: string): Promise<any> {
    const githubToken = GithubEnvConfigLoader.getGithubToken();

    const githubApiURL = `https://raw.githubusercontent.com/${TWIST_GITHUB_ACCOUNT}/${CONFIGURATION_REPO}/${branchName}/${filePath}`

    const headers = {
      "Accept-Encoding": "gzip, deflate",
      "Accept": "*/*",
      "Authorization": `token ${githubToken}`,
    }

    console.log(`Fetching category file from ${githubApiURL} on branch/env "${this.environment}"`)

    let res;
    try {
      res = await axios.get(githubApiURL, { headers })
    } catch (ex) {
      throw new Error(`Failed fetching ${githubApiURL}. Ex: ${ex}`)
    }

    // console.log(`AXIOS RESP: ${JSON.stringify(res?.data)}`)
    return res.data;
  }
}