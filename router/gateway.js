/**
 * Created by Administrator on 2017/4/11.
 */
const Router = require('koa-router');
const gateway = new Router();
const df = require('../db/data-fetcher');
const config = require('../config');
const moment = require('moment');
const log4js = require('log4js');
// log4js.configure({
//     appenders: { cheese: { type: 'file', filename: 'cheese.log' } },
//     categories: { default: { appenders: ['cheese'], level: 'error' } }
// });
const logger = log4js.getLogger('cheese');
logger.setLevel('ERROR');


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
            console.log('in gateway - before sql');
            let r = await df(`insert into gateway (g_time, g_result, g_date) values (${time}, '',now())`);
            console.log('in gateway - after sql');
            await next();
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