/**
 * Created by Administrator on 2017/5/17.
 */
/**
 * Created by Administrator on 2017/5/16.
 */

const fs = require('fs');
const rp = require('request-promise')
const config = require('../config')
const Promise = require('bluebird')
const tool = require('../tool');
const cheerio = require('cheerio');
const df = require('../db/async-db');
const logger = tool.logger
const moment = require('moment');

/**
 * 搜索功能检查 - UI测试用例在搜索时偶尔会搜不到结果（在本来能搜到的情况下），所以建立这个方法做7x24监控
 * @param searchUrl
 * @returns {boolean}
 */
let searchProduct = async searchUrl => {
    let searchResult = await rp.get(searchUrl);
    let $ = cheerio.load(searchResult)
    if (!$('.picture').length) {
        let QUERY_INSERTERROR = `insert into search_result (sr_url, sr_time) values ('${searchUrl}', now())`
        let inserted = await df(QUERY_INSERTERROR)
        if ((moment().get('minute') == 30)) {
            let QUERY_LISTERROR = 'select * from search_result sr where sr.sr_reported = 0'
            let issueList = await df(QUERY_LISTERROR)
            tool.sendMailWithDetails(`搜索结果页面又出现了${issueList.length}次错误`, '搜索结果监控报告', '米兰自动化测试中心', 'lvchao@milanoo.com,wangzhihua@milanoo.com')
            let QUERY_UPDATEALL = 'update search_result sr set sr.sr_reported = 1'
            await df(QUERY_UPDATEALL)
        }
    }
}

searchProduct('http://m.milanoo.com/search?searchTag=1&keyword=71814')

module.exports = {
    searchProduct: searchProduct
}