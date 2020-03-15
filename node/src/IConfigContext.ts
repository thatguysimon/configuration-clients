/* eslint-disable @typescript-eslint/interface-name-prefix */
export default interface IConfigContext {
    // Performs the actual configuration template processing
    // shall return JSON representation of data substituted from context data.
    process(json: any): any;

    // add context data
    add(key: string, val: any): void;

    isProduction(): boolean;
}
