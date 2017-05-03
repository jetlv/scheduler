/**
 * Created by Administrator on 2017/4/11.
 */
const Router = require('koa-router');
const gateway = new Router();
const df = require('../db/data-fetcher');
const config = require('../config');
const moment = require('moment');
const logger = require('../tool').logger;
const worker = require('../worker/gateway504Checker').test504;
const fetcher = require('../worker/gateway504Checker').fetchResults;

/**
 * 测试504 issue
 * @param ctx
 */
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

/**
 * 获取列表
 * @param ctx
 * @returns {*}
 */
let resultFetcher = async ctx => {
    let result = await fetcher(0);
    ctx.body = result;
}
gateway.get('/gateway', checker);
gateway.get('/gateway/list', resultFetcher)

module.exports = {
    gateway: gateway,
    scheduled_checker: worker
};