/**
 * Created by Administrator on 2017/6/9.
 */

const Router = require('koa-router');
const landing = new Router();
const config = require('../config');
const moment = require('moment');
const logger = require('../tool').logger;
const urlValidator = require('../tool').urlValidator
const fetcher = require('../worker/gateway504Checker').fetchResults;
const fs = require('fs')
const path = require('path')



/**
 * 加载结果列表页面
 * @param ctx
 */
let landingHandler = async(ctx) => {
    await ctx.render(`landing`)
}

let infoSaved = async(ctx) => {
    ctx.body = 'Ordered successfully!'
}

landing.get('/landing', landingHandler);
landing.get('/saved', infoSaved);


module.exports = {
    landing: landing,
};