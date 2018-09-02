import {Message} from '../../model/message/message';
import {MessageQueue} from './message-queue';
import {Observable, Subject} from 'rxjs';
import {v4} from 'uuid';
import {injectable} from 'inversify';

@injectable()
export class MessageQueueImpl implements MessageQueue {
    private queue: Subject<Message<any>>;

    constructor() {
        this.queue = new Subject<Message<any>>();
    }

    enqueue<T>(input: Message<T>, payload?: T): Message<T> {
        const message: Message<T> = {
            id: v4(),
            status: input.status,
            source: input.source,
            time: new Date(),
            meta: input.meta,
            type: input.type,
            payload: payload
        }

        if (input.id) {
            message.previous = input;
        }
    
        this.queue.next(message);

        return message;
    }    

    stream<T>(): Observable<Message<T>> {
        return this.queue;
    }
}