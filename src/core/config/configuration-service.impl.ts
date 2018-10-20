import {ConfigurationService} from './configuration-service';
import {Configuration} from './configuration'
import {injectable} from 'inversify';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Read configuration from /config
 *
 * Note:
 * 1) Put all common configuration in common.json
 * 2) Extend common using {environment}.json, where environment is specified in NODE_ENV
 */
@injectable()
export class ConfigurationServiceImpl implements ConfigurationService {
    public static DEFAULT_ENV = 'default';

    private configuration: Configuration;
    private targetEnvironment: string;

    constructor(private env: any) {
        if (env.NODE_ENV) {
            this.load(env.NODE_ENV);
        } else {
            this.load(ConfigurationServiceImpl.DEFAULT_ENV);
        }
    }

    get environment(): string {
        return this.targetEnvironment;
    }

    get config(): Configuration {
        return this.configuration;
    }

    load(env: string): void {
        this.targetEnvironment = env;

        const common = path.join(process.cwd(), 'config', 'common.json');
        this.configuration = JSON.parse(fs.readFileSync(common, 'utf8'));
        try {
            const file = path.join(process.cwd(), 'config', env + '.json');
            const input = fs.readFileSync(file, 'utf8');
            if (input) {
                this.configuration = this.merge(this.configuration, JSON.parse(input));
            }
        } catch (ex) {
            // Must use console log as logging is not configured yet
            console.log(ex.message);
        }

        this.overrideFromEnv(this.configuration);
    }

    private overrideFromEnv(config: any, name?: string): void {
        for (const key in config) {
            let path;
            if (name) {
                path = name + '_' + key.toUpperCase();
            } else {
                path = key.toUpperCase();
            }

            if (this.isObject(config[key])) {
                this.overrideFromEnv(config[key], path);
            } else {
                if (this.env[path]) {
                    const val = this.env[path];
                    if (val === 'true' || val === 'false') {
                        config[key] = (val === 'true');
                    } else if (!isNaN((parseFloat(val)))) {
                        config[key] = parseFloat(val);
                    } else {
                        config[key] = val;
                    }
                }
            }
        }
    }

    private isObject(obj: any): boolean {
        if (typeof obj === 'object') {
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    return true;
                }
            }
        }
        return false;
    }

    private merge(target: any, add: any): any {
        for (const key in add) {
            if (add.hasOwnProperty(key)) {
                if (target[key] && this.isObject(target[key]) && this.isObject(add[key])) {
                    this.merge(target[key], add[key]);
                } else {
                    target[key] = add[key];
                }
            }
        }

        return target;
    }
}
