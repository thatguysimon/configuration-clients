export const PRODUCTION_BRANCH_NAME = 'production';
export const ENV_VAR_NAME = 'TWIST_ENV';
export const ENVS_VAULT_KEY = 'envs';
export const PRODUCTION_ENV_CONTEXT_NAME = 'production';
export const DEVELOPMENT_ENV_CONTEXT_NAME = 'dev';
export const QA_ENV_CONTEXT_NAME = 'qa';
export const STAGING_ENV_CONTEXT_NAME = 'staging';
export const QA_BRANCH_NAME = 'qa';
export const STAGING_BRANCH_NAME = 'staging';

// while we might end up using a different contextual environments pipeline (for example: staging -> production or qa -> staging -> production )
// the below is a tool to defining the actual context based on branch name.add()
// Based on the current logic implemented via config-context, the below suggests that:
//
// "production" branch is production
// "dev" or "develop" branch names are dev
// "qa" branch name is qa
// "staging" is the branch name and SO ARE ALL THE REST (anything other than production, dev, develop, qa) is staging!
//
// the context is majorly used in order to determine the below functionality:
// 1. what vault name to pull secrets from (secret/staged/* vs secret/qa/* etc)
// 2. Legacy hard coded conditions refering to different env based behavior.
// 3. Cluster to apply deployment to (yet not impl)
const ENV_CONTEXT_TO_BRANCH_NAME_MAPPING = {
    [PRODUCTION_ENV_CONTEXT_NAME]: [PRODUCTION_BRANCH_NAME],
    [DEVELOPMENT_ENV_CONTEXT_NAME]: ['dev', 'develop'],
    [QA_ENV_CONTEXT_NAME]: [QA_BRANCH_NAME],
    [STAGING_ENV_CONTEXT_NAME]: [STAGING_BRANCH_NAME],
};

const FIXED_ENVS = [
    PRODUCTION_ENV_CONTEXT_NAME,
    DEVELOPMENT_ENV_CONTEXT_NAME,
    'develop',
    QA_ENV_CONTEXT_NAME,
    STAGING_ENV_CONTEXT_NAME,
];

export default function isProduction(): boolean {
    return process.env[ENV_VAR_NAME] === PRODUCTION_BRANCH_NAME;
}

export function getContextualEnv() {
    const actualBranchName: string = process.env[ENV_VAR_NAME] || '';
    // the default env context for dynamic env (non-production)
    let result = DEVELOPMENT_ENV_CONTEXT_NAME;
    Object.entries(ENV_CONTEXT_TO_BRANCH_NAME_MAPPING).forEach(([contextName, contextRelatedBranchNames]) => {
        if (contextRelatedBranchNames.includes(actualBranchName)) {
            result = contextName;
        }
    });
    return result;
}

export function isFixedEnv(envName: string): boolean {
    return FIXED_ENVS.includes(envName);
}
