/**
 * Created by Administrator on 2017/4/11.
 */
const Router = require('koa-router');
const emailreport = new Router();
const config = require('../config');
const moment = require('moment');
const logger = require('../tool').logger;
const path = require('path');
const templateDir = 'templates/daily-report'
const EmailTemplate = require('email-templates').EmailTemplate
const gatewayReport = require('../worker/gateway504Checker').fetchResults;
const uiReport = require('../worker/milanooUITestTrigger').queryUiTestInfo
const tool = require('../tool')

let makeReport = async() => {
    let template = new EmailTemplate(templateDir)
    let ui = await uiReport();
    let gateway = await gatewayReport();
    //当前活跃项目
    let runningProjectCount = ui.projects.length;
    //当日运行的用例数量
    let runTestCaseCount = ui.reports.length;
    //失败项目的数量
    let failureReportCount = ui.failedTests.length;
    //成功率
    let successRate = (100 - parseFloat(failureReportCount / ui.reports.length) * 100) + '%';
    //504测试结果集
    let gatewayResults = gateway;
    //UI测试失败结果集
    let uiTestResults = ui.failedTests
    //数据加载
    let loader = {
        runningProjectCount: runningProjectCount,
        runTestCaseCount: runTestCaseCount,
        failureReportCount: failureReportCount,
        successRate: successRate,
        gatewayResults: gatewayResults,
        uiTestResults: uiTestResults
    }
    // let html = template.render(loader).html;
    let rendered = await template.render(loader)
    tool.sendDailyReport(rendered.html)
    return new Promise((res, rej) => {
        res(loader);
    })
}

/**
 * 作统计报告
 */
emailreport.get('/report/send', async(ctx, next) => {
    await makeReport();
    ctx.body = {
        success: true
    }
});

module.exports = {
    emailreport: emailreport,
    makeReport: makeReport
};