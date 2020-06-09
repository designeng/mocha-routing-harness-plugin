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

    deferredFork: {
        createDeferredFork: {
            path: __dirname + '/assets/express/app.js'
        }
    },

    @args({$ref: 'deferredFork'})
    appProcess: (deferredFork) => deferredFork(), /* Run app process first */

    @args()
    eventEmitter: () => {
        const em = new EventEmitter();
        setTimeout(function() {
            em.emit('someEvent', 'a');
        }, 998)
        setTimeout(function() {
            em.emit('someEvent', 'b');
        }, 999)
        setTimeout(function() {
            em.emit('close', 'c');
        }, 1000)
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
