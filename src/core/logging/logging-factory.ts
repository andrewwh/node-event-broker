import * as Bunyan from 'bunyan';
import {Request} from 'restify';
import {Configuration} from '../config';
import {mkdirSync, existsSync} from 'fs';
import {parse} from 'path';
import * as BunyanFormat from 'bunyan-format';

export class AbstractLoggingFactory {
    static getLoggingFactory(config?: Configuration): LoggingFactory {
        return new LoggingFactoryImpl(config);
    }
}

export interface LoggingFactory {
    getLogger(): Bunyan;
    getRequestLogger(request: Request, messageId?: string): Bunyan;
}

export class LoggingFactoryImpl {
    private log: Bunyan;

    constructor(config: Configuration) {
        const path = parse(config.logging.fileName);
        if (path.dir !== './' && !existsSync(path.dir)) {
            mkdirSync(path.dir);
        }

        const settings: Bunyan.LoggerOptions = {
            name: 'application',
            streams: [
                {
                    type: 'file',
                    level: Bunyan.levelFromName[config.logging.level.toLocaleLowerCase()],
                    path: config.logging.fileName
                }
            ]
        };

        if (config.logging.stdout) {
            const formatter = new BunyanFormat({
                outputMode: 'short'
            });
                        
            settings.streams.push(
                {
                    level: Bunyan.levelFromName[config.logging.level.toLocaleLowerCase()],
                    stream: formatter
                }           
            );
        }

        this.log = Bunyan.createLogger(settings);
    }

    getLogger(): Bunyan {
        return this.log;
    };    

    getRequestLogger(request: Request, messageId?: string): Bunyan {
        const data = {
                        correlation: {
                            messageId: messageId,
                            method: request.method ? request.method.toLocaleUpperCase() : '',
                            path: request.path() ? request.path() : 'unknown'      
                        }
                    };

        return this.getLogger().child(data);
    }    
}

export const Logger = Symbol('Logger');
export const LoggingFactoryType = Symbol('LoggingFactoryType');
