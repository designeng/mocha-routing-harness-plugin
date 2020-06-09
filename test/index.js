import mochaRoutingHarnessPlugin from '../index';
import wire from 'wire';
import chai, { expect } from 'chai';
import EventEmitter from 'events';
import forkProcessPlugin from 'fork-process-plugin';
import args from './decorators/args';

let context;

const spec = {
    $plugins: [
        mochaRoutingHarnessPlugin,
        forkProcessPlugin
    ],

    deferredAppFork: {
        createdeferredAppFork: {
            path: __dirname + '/assets/express/app.js'
        }
    },

    @args({$ref: 'deferredAppFork'})
    appProcess: (deferredAppFork) => deferredAppFork(), /* Run app process first */

    @args({$ref: 'appProcess'})
    eventEmitter: (appProcess) => {
        const em = new EventEmitter();
        appProcess.on('message', message => {
            if(message === 'error') {
                em.emit('appEvent', 0);
            }
            if(message === 'online') {
                em.emit('appEvent', 1);
            }
        })
        return em;
    },

    mochaHarness: {
        createMochaHarness: [
            __dirname + '/assets/success'
        ]
    },

    fromEmitterStream: {
        createStreamFromEventEmitter: {
            emitter: {$ref: 'eventEmitter'}
        }
    }
}

before(async () => {
    try {
        context = await wire(spec);
    } catch (err) {
        console.log('Wiring error', err);
    }
});

describe('harness', () => {
    it('should be created', async () => {
        await expect(context).to.be.ok;
    });
});

after(async () => {
    setTimeout(() => {
        console.log('DESTROY');

        const appProcess = context.appProcess;
        appProcess.send('shutdown');
        context.destroy();
    }, 2000)
});
