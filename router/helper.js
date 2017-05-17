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

/**
 * 方法描述： 按语言站跑完一整个订单流程，到打包发货为止，商品是固定的
 * 老接口访问例子 : http://192.168.12.100:1337/api/progress/completeorder/en/jetlyu@milanoo.com/123456
 * @param ctx
 */
let completedOrder = async ctx => {
    try {
        let lang = ctx.params.lang;
        let email = ctx.params.email;
        let password = ctx.params.password;
        if (!email || !password) {
            ctx.body = {success: false, message: "请传入邮箱和密码"}
        }
        let result = await rp.get('http://192.168.12.100:1337/api/progress/completeorder/' + lang + '/' + email + '/' + password);
        ctx.body = result;
    } catch (err) {
        ctx.body = {success: false, message: err}
    }
}

helper.get('/old/ht/member/id/:email', getIdByMail)
helper.get('/old/progress/completeorder/:lang/:email/:password', completedOrder)

module.exports = {
    helper: helper
}
