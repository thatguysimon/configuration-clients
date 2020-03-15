export const PRODUCTION_BRANCH_NAME = 'master';
export const ENV_VAR_NAME = 'TWIST_ENV';

export default function isProduction(): boolean {
    return process.env[ENV_VAR_NAME] === PRODUCTION_BRANCH_NAME;
}
