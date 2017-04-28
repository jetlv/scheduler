/**
 * Created by Administrator on 2017/4/11.
 */
const Router = require('koa-router');
const mf = new Router();
const config = require('../config');
const moment = require('moment');
const logger = require('../tool').logger;
const worker = require('../worker/mobileFriendlyChecker');

mf.get('/mf', async(ctx) => {
    let link = ctx.query.link;
    if (!link) {
        ctx.body = {
            success: false,
            code: config.code_system
        }
    } else {
        let isMobileFriendly = await worker(link);
        ctx.body = {
            success: true,
            code : config.code_success,
            isMobileFriendly : isMobileFriendly
        }
    }
});

module.exports = mf;