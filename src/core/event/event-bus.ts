import {MessageQueue} from './message-queue';
import {Message} from '../../model/message';
import {Observable} from 'rxjs';

export interface EventBus {
    getQueue(name?: string): MessageQueue;
    enqueue<T>(message: Message<T>, name?: string): MessageQueue;
    dequeue<T>(name?: string): Observable<Message<T>>;
}

export const EventBusType = Symbol('EventBus')