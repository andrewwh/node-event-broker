export interface Ping {
    version: string;
    name: string;
    now: Date;
}

export interface Health extends Ping {
    uptime: number;
    memory: {
        rss?: number;
        heapTotal?: number;
        heapUsed?: number;
        external?: number;
      };
    cpu: {
        user?: number;
        system?: number;
    };
}
