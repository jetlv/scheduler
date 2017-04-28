/**
 * Created by Administrator on 2017/4/11.
 */
const Router = require('koa-router');
const uitest = new Router();
const df = require('../db/data-fetcher');
const config = require('../config');
const moment = require('moment');
const logger = require('../tool').logger;
const testEnv = require('../worker/milanooUITestTrigger').testEnv;
uitest.get('/uitest/testitem', async(ctx, next) => {
    ctx.body = {
        success: true,
        code: config.code_success
    }
    testEnv();

});

module.exports = uitest;