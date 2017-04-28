/**
 * Created by Administrator on 2017/4/11.
 */
const Router = require('koa-router');
const broken = new Router();
const df = require('../db/data-fetcher');
const config = require('../config');
const moment = require('moment');
const logger = require('../tool').logger;
const worker = require('../worker/milanooBrokenLinkChecker');

broken.get('/broken', async(ctx, next) => {
    ctx.body = {success: true, code: config.code_success};
    worker();
});

module.exports = broken;