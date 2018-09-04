import * as chai from 'chai';
import 'mocha';
import {StrictThrottle} from './strict-throttle';

const expect = chai.expect;

describe('Strict throttle', () => {

    it('the listener should process 10 entries at 200rpm in 2.7 seconds', (done) => {
            const start = new Date().getTime();

            const listener = (v: number, throttle: StrictThrottle<number>): void => {
                if (v === 10) {
                    throttle.pause();

                    const end = new Date().getTime();
                    const interval = (end-start)/100;

                    // 200 requests per/minute is 10 requests in 3 seconds but as it starts at 0 is actually 2.7 seconds
                    // It can be off by a few millseconds as timeout is not deterministic.
                    
                    expect(Math.round(interval)/10).to.equal(2.7);

                    done();
                }
            }
    
            // Should execute in about 3 seconds
            const throttle = new StrictThrottle<number>(200, listener, [1,2,3,4,5,6,7,8,9,10,11,12]);
    });

});
