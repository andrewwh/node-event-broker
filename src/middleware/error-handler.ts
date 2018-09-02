import {Request, Response, Route } from 'restify';

/**
 * Log any unexpected errors
 *
 */
export const ErrorHandler = (request: Request, response: Response, route: Route, callback: ()=>any) => {
    return callback();
};
