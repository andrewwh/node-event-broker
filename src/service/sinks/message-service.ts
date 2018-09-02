import {MessageReceipt} from '../../model/api'
export interface MessageService {
    send(type: string, payload: any): Promise<MessageReceipt>;
}

export const MessageServiceType = Symbol('MessageService')