/**
 * Created by Administrator on 2017/5/9.
 */

/**
 * 老框架中米兰业务辅助的api
 * 这个路由在完成后将不再更新，同时12:100上的代码也不再作更新，只做必要维护
 * @type {Router}
 */
const Router = require('koa-router');
const helper = new Router();
const df_milanootest = require('../db/data-fetcher-milanootest');
const config = require('../config');
const moment = require('moment');
const logger = require('../tool').logger;
const worker = require('../worker/gateway504Checker').test504;
const fetcher = require('../worker/gateway504Checker').fetchResults;
const rp = require('request-promise')
const oldBase = 'http://192.168.12.100:1337'

/**
 * 方法描述：根据传入邮箱取用户的ID
 * 参数: email
 * 响应例子：{"code": 1,"memberEmail": "milanootest321@gmail.com","mid": 4001616}
 * 老接口访问例子: http://192.168.12.100:1337/api/ht/member/id/lvchao@milanoo.com
 * @param ctx
 */
let getIdByMail = async ctx => {
    try {
        let email = ctx.params.email;
        if (!email) {
            ctx.body = {success: false, message: "请传入email"}
        }
        let result = await rp.get('http://192.168.12.100:1337/api/ht/member/id/' + email);
        ctx.body = result;
    } catch (err) {
        logger.error(err);
        ctx.body = {success: false}
    }
}


helper.get('/old/ht/member/id/:email', getIdByMail)

module.exports = {
    helper: helper
}
