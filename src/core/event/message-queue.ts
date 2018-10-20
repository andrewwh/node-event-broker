import {Message} from '../../model/message/message';
import {Observable} from 'rxjs';

export interface MessageQueue {
    /**
     * Enqueue a message 
     * 
     * @param message 
     */
    enqueue<T>(message: Message<T>): MessageQueue;

    /**
     * Get the observable stream of events associated with this queue
     */
    stream<T>(): Observable<Message<T>>;
}
export const MessageQueueType = Symbol('MessageQueue');