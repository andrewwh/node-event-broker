import { Controller, Post, Put, Delete } from 'inversify-restify-utils';
import { Request } from 'restify';
import { injectable, inject } from 'inversify';
import { MessageReceipt } from '../model/api';
import { HttpError, InvalidArgumentError, InternalServerError } from 'restify-errors';
import { Logger } from '../core/logging';
import { Message, MessageStatus, MessageBuilder, MessageAction } from '../model/message';
import { EventBusType, EventBus } from '../core/event';
import * as Bunyan from 'bunyan';
import {filter} from 'rxjs/operators';

@injectable()
@Controller('')
export class MessageController {

    constructor(@inject(Logger) private log: Bunyan,
        @inject(EventBusType) private bus: EventBus
    ) { }

    /**
     * Receive a message on path /message/{type} with JSON body.
     * 
     * Http verbs are converted to actions as:
     * 
     * POST = Create
     * PUT = Update
     * DELETE = Delete
     * 
     * Query parameters:
     * 
     * source - Source system from which the message was sent
     * 
     * sync - Return transformation or response from data sink from this invocation
     *
     * @param request
     */
    @Post('/message/:type')
    @Put('/message/:type')
    @Delete('/message/:type')
    async message(request: Request): Promise<MessageReceipt | HttpError> {
        try {
            if (request.params.type == undefined) {
                return new InvalidArgumentError('Message must have a type.')
            }

            if (request.body == undefined) {
                return new InvalidArgumentError('Message event must have a body')
            }

            this.log.info({ body: request.body }, `Received event ${request.params.type} on ${request.path()}`);

            let messagePart: any = {
                status: MessageStatus.Arrived,
                type: request.params.type,
                action: this.toMessageAction(request.method),
                payload: request.body
            };

            if (request.query.source) {
                messagePart.source = request.query.source;
            }

            const message: Message<any> = MessageBuilder.build(messagePart);

            /*
            * Enqueue on the default event queue. We do this on the next tick so:
            * 1) We can return to the client immediately without any further processing
            * 2) If we want to return the synchronous result then it may already be processed 
            * and have transitioned through the bus.
            */
            process.nextTick(() => this.bus.enqueue(message));            

            if (request.query.sync === 'true') {
                return new Promise<any>( (resolve, reject) => {
                    this.bus
                    .dequeue<any>()
                    .pipe( filter( (f: Message<any>) => f.original.id === message.id && f.status !== MessageStatus.Arrived ) )
                    .subscribe( (result: Message<any>) => {                    
                        resolve(result.payload);
                    })
                });
            } else {
                return {
                    id: message.id,
                    time: message.time,
                    message: 'Message received'
                };
            }
        } catch (ex) {
            this.log.fatal('An error occurred when receiving message', ex);
            return new InternalServerError('Sorry are unable to process this request')
        }
    }

    private toMessageAction(method: string): MessageAction {
        switch (method) {
            case 'POST':
                return MessageAction.Create;

            case 'PUT':
                return MessageAction.Update;

            case 'DELETE':
                return MessageAction.Delete;
        }
    }
}
