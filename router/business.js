/**
 * Created by Administrator on 2017/5/9.
 */

/**
 * 新写的米兰业务逻辑辅助全部在这个api中
 *
 * @type {Router}
 */
const Router = require('koa-router');
const business = new Router();
const df_milanootest = require('../db/data-fetcher-milanootest');
const config = require('../config');
const moment = require('moment');
const logger = require('../tool').logger;
const worker = require('../worker/businessWorker')
const rp = require('request-promise')

/**
 * 巴西分期全流程
 * @param ctx
 */
let baxifenqi = async ctx => {
    // let placeOrder = worker.placeOrder;
    let baxifenqi = worker.fenqi;
    let lang = ctx.query.lang;
    let email = ctx.query.email;
    let password = ctx.query.password;
    let productId = ctx.query.productId;
    let month = ctx.query.month
    let context = await baxifenqi(lang, email, password, productId, month);
    ctx.body = context;
}


business.get('/business/baxifenqi', baxifenqi)

module.exports = {
    business: business
}
