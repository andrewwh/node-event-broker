import { injectable, inject } from 'inversify';
import {Message, MessageStatus, MessageBuilder} from '../model/message';
import {EventBusType, EventBus} from '../core/event';
import {Salutation} from '../model/api'
import {filter} from 'rxjs/operators';
import {Logger} from '../core/logging';
import * as Bunyan from 'bunyan';
import {toGoodBye} from '../transform/core';


@injectable()
export default class WelcomeMessageReceiver {
    constructor(@inject(EventBusType) private bus: EventBus,
                @inject(Logger) private log: Bunyan        
    ) {
        this.observe();
    }    

    private observe(): void {
        this.bus
            .dequeue<Salutation>()
            .pipe(
                filter( (v: Message<Salutation>) => v.status == MessageStatus.Arrived && v.type == 'welcome' )
            )
            .subscribe( (original: Message<Salutation>) => {
                this.log.info({event: original}, `Arrived welcome message`);

                const message = this.bus
                    .enqueue(MessageBuilder.extend(original, 
                                        {status: MessageStatus.Transformed, type: 'goodbye', payload: toGoodBye(original.payload)}));
            })
    }
}