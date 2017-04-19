/**
 * Created by Administrator on 2017/4/11.
 */
const Router = require('koa-router');
const gateway = new Router();
const df = require('../db/data-fetcher');
const config = require('../config');
const moment = require('moment');
const logger = require('../tool').logger;


gateway.get('/gateway', async(ctx, next) => {
    let time = ctx.query.time;
    if (!time) {
        ctx.body = {
            success: false,
            code: config.code_system,
            message: '请传入执行次数'
        }
    } else {
        try {
            let r = await df(`insert into gateway (g_time, g_result, g_date) values (${time}, '',now())`);
            ctx.body = {
                success: true,
                code: config.code_success
            }
        } catch (error) {
            logger.error(error.message);
        }
    }
});

module.exports = gateway;