/**
 * Created by Administrator on 2017/4/11.
 */
const Router = require('koa-router');
const domainChecker = new Router();
const config = require('../config');
const moment = require('moment');
const logger = require('../tool').logger;
const urlValidator = require('../tool').urlValidator
const fetcher = require('../worker/gateway504Checker').fetchResults;
const getDomain = require('get-domain-from-url');
const validator = require('validator');
const rp = require('request-promise')

/**
 * 测试domain是否可用
 * @param ctx
 */
let checker = async(ctx) => {
    let link = ctx.query.link;
    if ((!link) || !urlValidator(link)) {
        ctx.body = {success: false, message: 'Please input valid url'};
        return;
    }
    try {
        let body = await rp.get(link);
        ctx.body = {success: true, available: false};
    } catch (err) {
        if (err.message.indexOf('ENOTFOUND') !== -1) {
            let result = await rp({
                json: true,
                uri: 'https://api.ote-godaddy.com/api/v1/domains/available?domain=' + getDomain(link),
                method: 'GET'
            })
            ctx.body = {success: true, available: result.available}
        } else {
            ctx.body = {success: true, available: false}
        }
    }

}

domainChecker.get('/domainChecker', checker);

module.exports = {
    domainChecker: domainChecker,
};