/**
 * Created by Administrator on 2017/6/9.
 */

const Router = require('koa-router');
const reportLoader = new Router();
const config = require('../config');
const moment = require('moment');
const logger = require('../tool').logger;
const urlValidator = require('../tool').urlValidator
const fetcher = require('../worker/gateway504Checker').fetchResults;
const fs = require('fs')
const path = require('path')

var readFileThunk = function (src) {
    return new Promise(function (resolve, reject) {
        fs.readFile(src, {'encoding': 'utf8'}, function (err, data) {
            if (err) return reject(err);
            resolve(data);
        });
    });
}


/**
 * 加载结果列表页面
 * @param ctx
 */
let list = async(ctx) => {
    let reportsFolder = "E:\\scheduler\\static\\"
    let timeline = ctx.query.timeline
    if(!timeline) {
        ctx.body = {success : false, message : "你要看哪次报告? 1st? 2nd? 3rd?"}
        return
    }
    reportsFolder += timeline + '\\'
    let reports = fs.readdirSync(reportsFolder);
    let respBody = ''
    reports.forEach((fileName, index, array) => {
        respBody += `<a href="${reportsFolder}${fileName}\\index.html">${fileName}</a><br>`
    })
    ctx.body = respBody
}

let report = async ctx => {
    let reportsFolder = `./static/`
    let file = ctx.query.file
    if(!file) {
        ctx.boy = {success: false, message : '请给出文件名称'}
    }
    let reportHtmlPath = `${reportsFolder}${file}/index.html`
    if(!fs.existsSync(reportHtmlPath)){
        ctx.boy = {success: false, message : `没找到文件${file}` }
    }
    let html = await readFileThunk(reportHtmlPath)
    ctx.body = html
    // await ctx.render(reportHtmlPath)
}

reportLoader.get('/reportList', list);
reportLoader.get('/loadReport', report)


module.exports = {
    reportLoader: reportLoader,
};