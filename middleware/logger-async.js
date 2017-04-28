const config = require('../config');

function log(ctx) {
    if (config.debug) {
        console.log(ctx.method, ctx.header.host + ctx.url)
    }
    return new Promise((res, rej) => {
        res(0);
    })
}


module.exports = function () {
    return async(ctx, next) => {
        await log(ctx);
        await next();
    }
}