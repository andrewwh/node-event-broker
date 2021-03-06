import 'reflect-metadata';
import {InversifyRestifyServer} from 'inversify-restify-utils';
import {Server} from 'restify';
import {container} from './container';
import {Configuration, ConfigurationType} from './core/config';
import {Logger} from './core/logging';
import * as Bunyan from 'bunyan';
import {ErrorHandler} from './middleware';
import {bodyParser, queryParser} from 'restify-plugins';

function main(argv?: string[]) {
    const config: Configuration = container.get<Configuration>(ConfigurationType);
    const log = container.get<Bunyan>(Logger);

    const builder = new InversifyRestifyServer(container, {defaultRoot: config.basePath});
    builder.setConfig( (app: Server) => {
        try {
            log.info('Registering body parser');
            app.use(bodyParser());

            log.info('Registering query parser');
            app.use(queryParser());
            
            log.info('Registering error handler');
            app.on('restifyError', ErrorHandler);

            log.info('Setting global server logger');
            app.log = log;
            
            log.info('Finished server configuration');
        } catch (ex) {
            log.error('Fatal error occurred while registering hapi extentions', ex);
        }
    });

    builder
        .build()
        .listen(config.port, 'localhost',
            (err: Error) => {
                if (err) {
                    log.error(err);
                }

                log.info(`Started Event broker API Server on port ${config.port} at base ${config.basePath}`);
            }
        );

    // Send a signal that the process is ready to receive requests (listened to by pm2 or other process manager)
    // This function is only available if this process is spawned as a child.
    if (process.send) {
        log.info('This application is running as a child process. Sending ready signal to parent');
        process.send('ready');
    }

    log.info('Registering process hooks');

    process.on('exit', () => {
        log.info('Process has exited');
    });

    process.on('SIGTERM', () => {
        log.info('SIGTERM: Request to terminate received. Application is stopping...');
        process.exit();
    });

    process.on('SIGINT', () => {
        log.info('SIGINT: Request to interrupt received. Application is stopping...');

        // TODO It would be good to stop incomming messages and wait for all current events to be processed.
        process.exit();
    });

    process.on('SIGHUP', () => {
        log.info('SIGHUP: Request to hang-up received. Ignoring signal.');
    });

}

main(process.argv);