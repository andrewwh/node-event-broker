import {Message} from '../../model/message/message';
import {MessageQueue} from './message-queue';
import {Observable, Subject} from 'rxjs';
import {injectable} from 'inversify';

@injectable()
export class MessageQueueImpl implements MessageQueue {
    private queue: Subject<Message<any>>;

    constructor(private queueName?: string) {
        this.queue = new Subject<Message<any>>();
    }

    get name() {
        return this.queueName;
    }

    enqueue<T>(message: Message<T>): MessageQueue {
        this.queue.next(message);

        return this;
    }    

    stream<T>(): Observable<Message<T>> {
        return this.queue;
    }
}