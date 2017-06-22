/**
 * Created by Administrator on 2017/6/22.
 */
const Router = require('koa-router');
const lt = new Router();
const config = require('../config');
const moment = require('moment');
const logger = require('../tool').logger;
const loadTestWorker = require('../worker/loadTestWorker').loadTestingLogic
const db = require('../db/data-fetcher')

lt.get('/loadtest', async ctx => {
    let query_new = `insert into loadtest (run_date) values (now())`
    let inserted = await db(query_new)
    let insertedId = inserted.insertId
    let host = ctx.request.header.host
    ctx.body = `执行成功，请直接访问 http://${host}/view?id=${insertedId} 查看结果`
    loadTestWorker(insertedId, ctx)
})

lt.get('/view', async ctx => {
    let id = ctx.query.id
    let query_new = `select * from loadtest l where l.id = ${id}`
    let report = await db(query_new)
    ctx.body = report
})

module.exports = {
    lt: lt
}
