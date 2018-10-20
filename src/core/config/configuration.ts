export interface LoggingConfiguration {
    level: string;
    fileName: string;
    logHeartbeat: boolean;
    stdout?: boolean;
}

export interface Hystrix {
    name?: string;
    errorThreshold?: number;
    concurrency?: number;
    windowLength?: number;
    numberOfBuckets?: number;
    timeout?: number;
}

export interface Configuration {
    port: number;
    host: string;
    basePath: string;
    logging: LoggingConfiguration;
    messageService: {
        endpoint: string;
        timeout: number;
        hystrix?: Hystrix;
    };
}
export const ConfigurationType = 'Configuration';
