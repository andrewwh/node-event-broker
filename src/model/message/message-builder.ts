import {Message} from './message';
import {MessageStatus} from './message-status';
import {MessageAction} from './message-action';
import {v4} from 'uuid';
import * as R from 'ramda';

export interface PartialMessage<T> {
    /**
     * UUID
     */
    id?: string;

    /**
     * Message status or state
     */
    status?: MessageStatus;

    /**
     * Desired action for the message on the destination(s)
     */
    action?: MessageAction;    

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

    /**
     * Previous message if it has been transformed
     */
    original?: Message<any>;    
}

export class MessageBuilder {
    /**
     * Build a message from a partial message. This will always generate a new id and timestamp. 
     * All messages are immutable (Object.freeze)
     * 
     * @param input partial message properties
     * 
     */
    static build<T>(input: PartialMessage<T>): Message<T> {
        const message: Message<T> = {
            id: v4(),
            status: input.status,
            source: input.source,
            time: new Date(),
            meta: input.meta,
            type: input.type,
            action: input.action,
            payload: input.payload,
            original: input.original
        }

        if (input.id) {
            message.previous = input as Message<T>;
        }

        if (!message.original) {
            message.original = message;
        }

        return Object.freeze(message);
    }

    /**
     * Immutably extend an existing message and produce a new message
     * 
     * @see build
     * 
     * @param source 
     * @param input 
     */
    static extend<T>(source: PartialMessage<T>, input: PartialMessage<T>): Message<T> {
        return MessageBuilder.build(R.merge(source, input));
    }
}