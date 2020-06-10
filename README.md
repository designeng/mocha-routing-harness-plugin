## Mocha harness plugin for wire.js

## Installation
`npm i mocha-routing-harness-plugin`

Install wire from `git://github.com/cujojs/wire.git#0.10.11`

## Usage
```
import wire from 'wire';
import mochaRoutingHarnessPlugin from 'mocha-routing-harness-plugin';

const spec = {
    $plugins: [
        mochaRoutingHarnessPlugin
    ],

    mochaHarness: {
        createMochaHarness: [
            __dirname + '/assets'
        ]
    }
}

wire(spec);
```
