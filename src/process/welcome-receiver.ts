import { injectable, inject } from 'inversify';
import {Message, MessageStatus} from '../model/message';
import {MessageQueueType, MessageQueue} from '../service/event';
import {Salutation} from '../model/api'
import {filter} from 'rxjs/operators';
import {Logger} from '../service/logging';
import * as Bunyan from 'bunyan';
import {toGoodBye} from '../transform/core';
import * as R from 'ramda';

@injectable()
export default class WelcomeMessageReceiver {
    constructor(@inject(MessageQueueType) private queue: MessageQueue,
                @inject(Logger) private log: Bunyan        
    ) {
        this.observe();
    }    

    private observe(): void {
        this.queue
            .stream<Salutation>()
            .pipe(
                filter( (v: Message<Salutation>) => v.status == MessageStatus.Arrived && v.source == 'welcome' )
            )
            .subscribe( (m: Message<Salutation>) => {
                this.log.info({event: m}, `WelcomeMessageReceiver: Arrived welcome message`);

                const message = this.queue.enqueue(R.merge(m, {status: MessageStatus.Transformed, type: 'goodbye'}), toGoodBye(m.payload));

                this.log.info({event: message}, `WelcomeMessageReceiver: Requeued transformed message`);
            })
    }
}