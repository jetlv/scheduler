/**
 * Created by Administrator on 2017/4/11.
 */
const Router = require('koa-router');
const domainChecker = new Router();
const config = require('../config');
const moment = require('moment');
const logger = require('../tool').logger;
const fetcher = require('../worker/gateway504Checker').fetchResults;
const getDomain = require('get-domain-from-url');
const validator = require('validator');
const rp = require('request-promise')
/**
 * 验证url
 * @param link
 * @returns {boolean}
 */
let urlValidator = link => {
    if (typeof link !== 'string') {
        return false;
    }
    /** Validate url */
    let validatorOptions = {
        protocols: ['http', 'https'],
        require_protocol: true,
        allow_underscores: true,
        allow_trailing_dot: true
    };
    if (link.indexOf('#') !== -1) {
        let mainPart = link.split('#')[0];
        if (!validator.isURL(mainPart, validatorOptions)) {
            return false;
        }
        return true;
    } else {
        if (!validator.isURL(link, validatorOptions)) {
            return false;
        }
        return true;
    }
}

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