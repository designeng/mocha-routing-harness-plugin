const mochaRoutingHarnessPlugin = require('../index');
const wire = require('wire');
const chai = require('chai');
const expect = chai.expect;

const EventEmitter = require('events');
const forkProcessPlugin = require('fork-process-plugin');

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

    appProcess: {
        create: {
            module: (deferredFork) => {
                return deferredFork(); /* Run app process first */
            },
            args: [
                {$ref: 'deferredFork'}
            ]
        }
    },

    eventEmitter: {
        create: {
            module: () => {
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
            args: [
            ]
        }
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
