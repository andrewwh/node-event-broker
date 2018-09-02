import {MessageStatus} from './message-status';
import {v4} from 'uuid';

/**
 * Basic message on the queue (immutable)
 */
export interface Message<T> {
    /**
     * UUID
     */
    id?: string;

    /**
     * Message status or state
     */
    status?: MessageStatus;

    /**
     * Arrival time of message
     */
    time?: Date;

    /**
     * Extra meta data about the message
     */
    meta?: Map<string, string>;

    /**
     * Source system or arrival path
     */
    source?: string;

    /**
     * Message taxonomy
     */
    type?: string;

    /**
     * Message object
     */
    payload?: T;

    /**
     * Previous message if it has been transformed
     */
    previous?: Message<any>;
}