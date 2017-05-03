/**
 * Created by Administrator on 2017/4/11.
 */
const Router = require('koa-router');
const gateway = new Router();
const df = require('../db/data-fetcher');
const config = require('../config');
const moment = require('moment');
const logger = require('../tool').logger;
const worker = require('../worker/gateway504Checker');

let checker = async(ctx) => {
    let time = ctx.query.time;
    if (!time) {
        ctx.body = {
            success: false,
            code: config.code_system,
            message: '请传入执行次数'
        }
    } else {
        try {
            ctx.body = {
                success: true,
                code: config.code_success,
                message: '已经执行并且会在执行完毕后入库'
            }
            worker(time)
        } catch (error) {
            logger.error(error.message);
        }
    }
}
gateway.get('/gateway', checker);


module.exports = {
    gateway: gateway,
    scheduled_checker : worker
};