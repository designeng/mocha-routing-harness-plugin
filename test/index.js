import mochaRoutingHarnessPlugin from '../index';
import wire from 'wire';
import chai, { expect } from 'chai';
import forkProcessPlugin from 'fork-process-plugin';
import args from './decorators/args';
const workerpool = require('workerpool');

let context;

const spec = {
    $plugins: [
        mochaRoutingHarnessPlugin,
        forkProcessPlugin
    ],

    mochaHarness: {
        createMochaHarness: [
            __dirname + '/assets/success'
        ]
    },

    deferredRoutingTestsFork: {
        createDeferredFork: {
            path: __dirname + '/assets/routing/tests.js'
        }
    },

    deferredAppFork: {
        createDeferredFork: {
            path: __dirname + '/assets/express/app.js'
        }
    },

    @args({$ref: 'deferredAppFork'})
    appProcess: (deferredAppFork) => deferredAppFork(), /* Run app process first */

    @args()
    routingTests: () => workerpool.pool(__dirname + '/assets/workers/routingTests.js'),

    @args(
        {$ref: 'appProcess'},
        {$ref: 'routingTests'},
    )
    runRoutingTestsOnAppOnline: (appProcess, routingTests) => {
        return new Promise((resolve, reject) => {
            appProcess.on('message', message => {
                if(message === 'error') {
                    appProcess.send('shutdown');
                }
                if(message === 'online') {
                    routingTests.exec('run')
                        .then(function (result) {
                            console.log('Result: ' + result);
                            appProcess.send('shutdown');
                            resolve(result);
                            routingTests.terminate();
                        })
                        .catch(function (err) {
                            console.error('WORKER POLL ERROR:::::::::', err);
                            appProcess.send('shutdown');
                            reject(err);
                        });
                }
            });
        });
    }
}

before(async () => {
    try {
        context = await wire(spec);
        const result = context.runRoutingTestsOnAppOnline;

        console.log('CONTEXT CREATED. TESTS RESULT:', result);
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
        context.destroy();
    }, 2000)
});
