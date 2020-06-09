const workerpool = require('workerpool');

const mokePromise = () => new Promise((resolve, reject) => {
    setTimeout(function() {
        resolve('SOME WORKER POOL RESULT');
    }, 1000)
})

async function run(n) {
    return await mokePromise();
}

workerpool.worker({
    run
});
