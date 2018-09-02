import {MessageService} from './message-service';
import {injectable, inject} from 'inversify';
import {Configuration, ConfigurationType} from '../config';
import {post} from 'got';
import {Logger} from '../logging';
import * as Bunyan from 'bunyan';
import { MessageReceipt } from '../../model/api';

@injectable()
export class MessageServiceImpl implements MessageService {
    constructor(@inject(ConfigurationType) private config: Configuration,
                @inject(Logger) private log: Bunyan) {

    }

    async send(type: string, payload: any): Promise<MessageReceipt> {
        const url = `${this.config.messageService.endpoint}/${type}`;

        this.log.info(`MessageService: Sending message ${type} to ${url}`);

        const response = await post(url, {body: payload, json: true});
        const receipt = response.body as MessageReceipt;

        this.log.info(`MessageService: Message id for new message is ${receipt.id}`);

        return receipt;
    }
}