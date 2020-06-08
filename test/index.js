const mochaRoutingHarnessPlugin = require('../index');
const wire = require('wire');
const chai = require('chai');
const expect = chai.expect;

let context;

const spec = {
    $plugins: [
        mochaRoutingHarnessPlugin
    ],

    mochaHarness: {
        createMochaHarness: [
            __dirname + '/assets/success'
        ]
    },
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
    context.destroy();
});
