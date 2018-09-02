import { Controller, Post } from 'inversify-restify-utils';
import { Request } from 'restify';
import { injectable, inject } from 'inversify';
import { MessageReceipt } from '../model/api';
import { HttpError, InvalidArgumentError } from 'restify-errors';
import {Logger} from '../service/logging';
import {Message, MessageStatus} from '../model/message';
import {MessageQueueType, MessageQueue} from '../service/event';
import * as Bunyan from 'bunyan';

@injectable()
@Controller('')
export class MessageController {

    constructor(@inject(Logger) private log: Bunyan,
                @inject(MessageQueueType) private queue: MessageQueue
    ) {}

    /**
     * Receive a message on any sub-path.
     *
     * @param request
     */
    @Post('/message/:type')
    async message(request: Request): Promise<MessageReceipt | HttpError> {
        if (request.params.type == undefined) {
            return new InvalidArgumentError('Message must have a type.')
        }

        if (request.body == undefined) {
            return new InvalidArgumentError('Message event must have a body')
        }        

        this.log.info({body: request.body}, `MessageController: Received event ${request.params.type}`);
        
        const message: Message<any> = this.queue.enqueue({status: MessageStatus.Arrived, source: request.params.type}, request.body);
        
        return {
            id: message.id,
            time: message.time,
            message: 'Message received'
        }
    } 
}
