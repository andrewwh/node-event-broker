import {Controller, Get} from 'inversify-restify-utils';
import {injectable} from 'inversify';
import {Health, Ping} from '../model/api';

const pkg = require('../package.json');

/**
 * Response for requests to the health of the application
 */
@injectable()
@Controller('')
export class HealthController {

    constructor() {}

    /**
     * Get a lightweight response from the application which can be used by load balancers
     *
     * @param request
     */
    @Get('/heartbeat')
    getPing(): Ping {
        return {
            name: pkg.name,
            version: pkg.version,
            now: new Date()
        };
    }

    /**
     * Get a comprehensive health state of the running application
     *
     * @param request
     */
    @Get('/full')
    getHealth(): Health {
        return {
            version: pkg.version,
            name: pkg.name,
            now: new Date(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            cpu: process.cpuUsage()
        };
    }
}
