import 'reflect-metadata';
import {InversifyRestifyServer} from 'inversify-restify-utils';
import {Server} from 'restify';
import {ContainerFactory} from './container-factory';
import {Configuration, ConfigurationType} from './service/config';
import {Logger} from './service/logging';
import * as Bunyan from 'bunyan';
import {ErrorHandler} from './middleware';
import {bodyParser} from 'restify-plugins';

export class Main {
    private static instance: Main;

    public static getInstance(): Main {
        if (!Main.instance) {
            Main.instance = new Main();
        }

        return Main.instance;
    }

    private server: Server;
    private config: Configuration;

    public async start(): Promise<void> {
        if (this.server) {
            throw new Error('Application is already started');
        }

        const container = await ContainerFactory.getContainer();
        this.config = container.get<Configuration>(ConfigurationType);
        const log = container.get<Bunyan>(Logger);

        const builder = new InversifyRestifyServer(container, {defaultRoot: this.config.basePath});
        builder.setConfig( (app: Server) => {
            try {
                log.info('Registering body parser');
                app.use(bodyParser());

                log.info('Registering error handler');
                app.on('restifyError', ErrorHandler);

                log.info('Setting global server logger');
                app.log = log;
                
                log.info('Finished server configuration');
                this.server = app;
            } catch (ex) {
                log.error('Fatal error occurred while registering hapi extentions', ex);
            }
        });

        builder
            .build()
            .listen(this.config.port, 'localhost',
                (err: Error) => {
                    if (err) {
                        log.error(err);
                    }

                    log.info(`Started Experience API Server on port ${this.config.port} at base ${this.config.basePath}`);
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
}
