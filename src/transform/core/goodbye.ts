import {Salutation} from '../../model/api'

/**
 * Take a salutation and say goodbye with a bit of reverse message stuff to make it a bit different for each message.
 * 
 * @param hello
 */
export const toGoodBye = (hello: Salutation): Salutation => {

    return {
        message: `Goodbye world! (${hello.message.split('').reverse().join('')})`
    }
} 