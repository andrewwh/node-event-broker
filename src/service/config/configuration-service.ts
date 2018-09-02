import {Configuration} from './configuration';

export interface ConfigurationService {
    environment: string;
    config: Configuration;
    load(env: string): void;
}
export const ConfigurationServiceType = Symbol('ConfigurationService');
