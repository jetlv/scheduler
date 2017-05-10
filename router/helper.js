/**
 * Created by Administrator on 2017/5/9.
 */

/**
 * 米兰业务辅助的api
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

/**
 * 前台下订单
 * @param lang 目标语言站
 * @param usr  用户名（邮箱）
 * @param psw 密码
 */
let placeOrder = async (lang, usr, psw) =>{
    //根据邮箱拿到用户的ID
    let query_memId = 'select m.MemberId as mid from milanoo_member m where m.MemberEmail=\'' + usr + '\'';
    let memberId = await df_milanootest(query_memId);
    //基础url地址定义。如果是日本站，处理为milanoo.jp而不是milanoo/jp
    let base = 'http://test.item.www.milanoo.com/' + lang;
    if(lang == 'jp') {
        var base = 'http://test.item.www.milanoo.jp';
    }

}