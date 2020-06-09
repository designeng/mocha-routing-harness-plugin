var express = require('express');

var pid = process.pid;
process.send({ pid });

var app = express();

app.get('/', function (req, res) {
    res.end('Forked process');
});

var server = app.listen(3002, () => {
    console.log('Listening...');
});

process.on('SIGINT', () => {
    console.log('SIGINT EVENT');
    server.close();
    process.exit();
});

process.on('message', (message) => {
        if (message === 'shutdown') {
            console.log('SHUTDOWN:START');

            server.on('close', () => {
                console.log('SHUTDOWN:END');
                process.exit(0);
            });
            server.close(); /* stop express.js server */
        }
    });
