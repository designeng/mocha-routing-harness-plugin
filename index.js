const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const Mocha = require('mocha');

module.exports = function mochaRoutingHarnessPlugin(options) {
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
                failures ? resolve(1) : reject(0);
            });
        });
    }

    return {
        factories: {
            createMochaHarness
        }
    }
}
