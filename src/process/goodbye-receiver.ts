import { injectable, inject } from 'inversify';
import {Message, MessageStatus} from '../model/message';
import {MessageQueueType, MessageQueue} from '../service/event';
import {Salutation} from '../model/api'
import {filter} from 'rxjs/operators';
import {Logger} from '../service/logging';
import * as Bunyan from 'bunyan';

@injectable()
export default class GoodbyeMessageReceiver {
    constructor(@inject(MessageQueueType) private queue: MessageQueue,
                @inject(Logger) private log: Bunyan        
    ) {
        this.observe();
    }    

    private observe(): void {
        this.queue
            .stream<Salutation>()
            .pipe(
                filter( (v: Message<Salutation>) => v.status == MessageStatus.Arrived && v.source == 'goodbye' )
            )
            .subscribe( (m: Message<Salutation>) => {
                this.log.info({event: m}, `GoodbyeMessageReceiver: Arrived goodbye message - ${m.payload.message}. No further process to do.`);
            })
    }
}