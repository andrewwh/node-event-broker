import 'reflect-metadata';
import { interfaces, TYPE } from 'inversify-restify-utils';
import { Container } from 'inversify';
import { HealthController, MessageController } from './controller';
import { Configuration, ConfigurationType, ConfigurationService, ConfigurationServiceType, ConfigurationServiceImpl } from './service/config';
import { AbstractLoggingFactory, Logger,  LoggingFactory, LoggingFactoryType} from './service/logging';
import {MessageService, MessageServiceImpl, MessageServiceType} from './service/sinks';
import * as Bunyan from 'bunyan';
import {MessageQueueType, MessageQueue, MessageQueueImpl} from './service/event';
import {listSync} from 'fs-plus'

/**
 *
 * Factory to create a dependency injection container
 *
 */
export class ContainerFactory {
    static container: Container;

    public static async getContainer(): Promise<Container> {
        if (ContainerFactory.container) {
            return ContainerFactory.container;
        }
        ContainerFactory.container = await this.build();

        return ContainerFactory.container;
    }

    private static async build(): Promise<Container> {
        const container = new Container();

        container.bind<MessageQueue>(MessageQueueType).to(MessageQueueImpl).inSingletonScope();

        /* Request controllers */
        container.bind<interfaces.Controller>(TYPE.Controller).to(HealthController).whenTargetNamed('HealthController');
        container.bind<interfaces.Controller>(TYPE.Controller).to(MessageController).whenTargetNamed('MessageController');

        /* Configuration */
        container.bind<ConfigurationService>(ConfigurationServiceType).toConstantValue(new ConfigurationServiceImpl(process.env));
        const configuration = container.get<ConfigurationService>(ConfigurationServiceType);
        container.bind<Configuration>(ConfigurationType).toConstantValue(configuration.config);

        /* Logging */
        const loggingFactory = AbstractLoggingFactory.getLoggingFactory(configuration.config);
        container.bind<LoggingFactory>(LoggingFactoryType).toConstantValue(loggingFactory);

        const logger = loggingFactory.getLogger();
        container.bind<Bunyan>(Logger).toConstantValue(logger);

        /* Data sinks */
        container.bind<MessageService>(MessageServiceType).to(MessageServiceImpl);

        /* Load processors dynamically */
        const modules = listSync('./process')
        modules.forEach( async (m) => {
            const module = await import(`./${m}`);
            container.bind<any>(m).to(module.default).inSingletonScope();
            container.get(m);

            logger.info(`Dynamically loaded process module ${m}`);
        })  

        return container;
    }
}
