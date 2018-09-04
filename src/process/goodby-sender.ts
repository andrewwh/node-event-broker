import { injectable, inject } from 'inversify';
import {Message, MessageStatus} from '../model/message';
import {MessageQueueType, MessageQueue} from '../service/event';
import {Salutation} from '../model/api'
import {filter} from 'rxjs/operators';
import {Logger} from '../service/logging';
import * as Bunyan from 'bunyan';
import {MessageService, MessageServiceType} from '../service/sinks';
import {StrictThrottle} from '../util'

@injectable()
export default class GoodbyeMessageSender {
    private throttle: StrictThrottle<Message<Salutation>>;

    constructor(@inject(MessageQueueType) private queue: MessageQueue,
                @inject(Logger) private log: Bunyan,
                @inject(MessageServiceType) private messages: MessageService

    ) {
        // Throttle downstream requests to 200 rpm
        this.throttle = new StrictThrottle<Message<Salutation>>(200, (m: Message<Salutation>) => this.send(m));
        this.observe();
    }    

    private send(message: Message<Salutation>): void {
        this.messages.send(message.type, message.payload);
    }

    private observe(): void {
        this.queue
            .stream<Salutation>()
            .pipe(
                filter( (v: Message<Salutation>) => v.status == MessageStatus.Transformed && v.type == 'goodbye' )
            )
            .subscribe( (m: Message<Salutation>) => {
                this.log.info({event: m}, `GoodbyeMessageSender: Queueing goodbye message to event service`);
                this.throttle.push(m);
            })
    }
}