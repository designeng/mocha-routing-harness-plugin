const workerpool = require('workerpool');
const axios = require('axios');
const when = require('when');
const { expect } = require('chai');

const BASE_URL = 'http://localhost:3002';
const routes = [
    '/',
    '/users'
]

const mokePromise = () => {
    const makeRequest = (index) =>
        axios.get(BASE_URL + routes[index]).then(res => {
            console.log('res.status...', res.status);
            expect(res.status).to.equal(200);
        })

    return when.iterate(
        index => index + 1,
        index => index == routes.length,
        makeRequest,
        0
    ).then(_ => {
        return 'TESTS SUCCESS';
    });
}

async function run(n) {
    return await mokePromise();
}

workerpool.worker({
    run
});
