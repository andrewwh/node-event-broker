import { injectable, inject } from 'inversify';
import {Message, MessageStatus} from '../model/message';
import {EventBusType, EventBus} from '../core/event';
import {Salutation} from '../model/api'
import {filter} from 'rxjs/operators';
import {Logger} from '../core/logging';
import * as Bunyan from 'bunyan';

@injectable()
export default class GoodbyeMessageReceiver {
    constructor(@inject(EventBusType) private bus: EventBus,
                @inject(Logger) private log: Bunyan        
    ) {
        this.observe();
    }    

    private observe(): void {
        this.bus
            .dequeue<Salutation>()
            .pipe(
                filter( (v: Message<Salutation>) => v.status == MessageStatus.Arrived && v.type == 'goodbye' )
            )
            .subscribe( (m: Message<Salutation>) => {
                this.log.info({event: m}, `Arrived goodbye message - ${m.payload.message}. No further process to do.`);
            })
    }
}