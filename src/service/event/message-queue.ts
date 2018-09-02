import {Message} from '../../model/message/message';
import {Observable} from 'rxjs';

export interface MessageQueue {
    enqueue<T>(message: Message<T>, payload?: T): Message<T>;
    stream<T>(): Observable<Message<T>>;
}
export const MessageQueueType = Symbol('MessageQueue');