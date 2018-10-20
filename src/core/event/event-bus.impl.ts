import {EventBus} from './event-bus';
import {Message} from '../../model/message';
import {MessageQueue} from './message-queue';
import {MessageQueueImpl} from './message-queue.impl';
import {Observable} from 'rxjs';
import {injectable} from 'inversify';

const DEFAULT_QUEUE='default';

@injectable()
export class EventBusImpl implements EventBus {
    private queues: Map<string, MessageQueue>;

    constructor() {
        this.queues = new Map<string, MessageQueue>();

        this.queues.set(DEFAULT_QUEUE, new MessageQueueImpl(DEFAULT_QUEUE));
    }

    getQueue(name: string=DEFAULT_QUEUE): MessageQueue {
        return this.queues[name];
    }    
    
    enqueue<T>(message: Message<T>, name: string=DEFAULT_QUEUE): MessageQueue {
        const queue: MessageQueue = this.queues.get(name);
        if (queue) {
            queue.enqueue(message);
            return queue;
        }

        throw Error(`No queue found named ${name}`);
    }

    dequeue<T>(name: string=DEFAULT_QUEUE): Observable<Message<T>> {
        const queue: MessageQueue = this.queues.get(name);
        if (queue) {
            return queue.stream();
        }
        
        throw Error(`No queue found named ${name}`);
    }
}