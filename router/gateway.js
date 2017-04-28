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
            let r = await df(`insert into gateway (g_time, g_result, g_date) values (${time}, '',now())`);
            ctx.body = {
                success: true,
                code: config.code_success,
                message: '已经执行并且会在执行完毕后入库'
            }
            let inserid = r.insertId;
            let resultEntity = await worker(time);
            let count = resultEntity.count_504;
            let badCodes = resultEntity.badResponse;
            let updateQuery = df('update gateway g set g.g_result = ' + count + ', g.g_badresponse =' + badCodes + ' where g.id = ' + inserid)
            df(updateQuery);
        } catch (error) {
            logger.error(error.message);
        }
    }
}
gateway.get('/gateway', checker);


module.exports = {
    gateway: gateway,
    checker: checker
};