import { injectable, inject } from 'inversify';
import {Message, MessageStatus} from '../model/message';
import {MessageQueueType, MessageQueue} from '../service/event';
import {Salutation} from '../model/api'
import {filter} from 'rxjs/operators';
import {Logger} from '../service/logging';
import * as Bunyan from 'bunyan';
import {MessageService, MessageServiceType} from '../service/sinks';

@injectable()
export default class GoodbyeMessageSender {
    constructor(@inject(MessageQueueType) private queue: MessageQueue,
                @inject(Logger) private log: Bunyan,
                @inject(MessageServiceType) private messages: MessageService

    ) {
        this.observe();
    }    

    private observe(): void {
        this.queue
            .stream<Salutation>()
            .pipe(
                filter( (v: Message<Salutation>) => v.status == MessageStatus.Transformed && v.type == 'goodbye' )
            )
            .subscribe( async (m: Message<Salutation>) => {
                this.log.info({event: m}, `GoodbyeMessageSender: Forwarding goodbye message to event service`);

                await this.messages.send(m.type, m.payload);
            })
    }
}