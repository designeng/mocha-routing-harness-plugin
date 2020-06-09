const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const Mocha = require('mocha');
const most = require('most');

module.exports = function mochaRoutingHarnessPlugin() {
    function createMochaHarness({ resolve, reject }, compDef, wire) {
        wire(compDef.options).then(paths => {
            const mocha = new Mocha();

            const addSyncTestFiles = (dirs) => {
                _.forEach(dirs, dir => {
                    fs.readdirSync(dir)
                        .filter(file => file.substr(-3) === '.js')
                        .forEach(file => mocha.addFile(path.join(dir, file)));
                });
            }

            addSyncTestFiles(paths);

            mocha.run(function(failures) {
                failures ? reject(1) : resolve(0);
            });
        });
    }

    function createStreamFromEventEmitter({ resolve, reject }, compDef, wire) {
        const accumulate = (arr, x) => {
            arr.push(x);
            return arr;
        }

        wire(compDef.options).then(({ emitter })=> {
            const $stream = most.fromEvent('someEvent', emitter);
            $stream.scan(accumulate, []).forEach(s => console.log('DATA:', s));
            resolve($stream);
        });
    }

    return {
        factories: {
            createMochaHarness,
            createStreamFromEventEmitter
        },
        context: {
            error: (resolver, wire, err) => {
                console.log('ERROR:::', err);
                resolver.resolve();
            }
        }
    }
}
