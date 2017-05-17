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
const uiReportByDate = require('../worker/milanooUITestTrigger').queryUiTestInfoByDate
const brokenReport = require('../worker/milanooBrokenLinkChecker').queryResult
const searchResult = require('../worker/milanoooSearchResultChecker').querySearchResult
const tool = require('../tool')

/**
 * 抽取出当天真心没有跑成功的case
 * @param failedReports 所有失败的结果集
 * @param allReports  所有结果集
 * @returns {Array}
 */
let extractActualFailed = (failedReports, allReports) => {
    let actualFailed = [];
    failedReports.forEach((failed, index, array) => {
        let suceess = false;
        let testCaseId = failed.CASEID;
        allReports.forEach((report, index, array) => {
            if ((report.CASEID == testCaseId) && (report.STATUS == 2)) {
                suceess = true;
            }
        })
        if (!suceess) {
            actualFailed.push(failed);
        }
    })
    return actualFailed;
}


let makeReport = async(dateDiff) => {
    let template = new EmailTemplate(templateDir)
    let ui = [];
    let broken = [];
    let gateway = [];
    let search = [];
    if(dateDiff) {
        ui = await uiReportByDate(dateDiff);
        broken = await brokenReport(dateDiff)
        gateway = await gatewayReport(dateDiff);
        search = await searchResult(dateDiff)
    } else {
        ui = await uiReport();
        broken = await brokenReport();
        gateway = await gatewayReport();
        search = await searchResult()
    }
    //当前活跃项目
    let runningProjectCount = ui.projects.length;
    //当日运行的用例数量
    let runTestCaseCount = ui.reports.length;
    //当天彻底没有跑成功的测试用例
    let actualFailed = extractActualFailed(ui.failedTests, ui.reports);
    //失败项目的数量
    let failureReportCount = actualFailed.length;
    //成功率
    let successRate = (100 - parseFloat(failureReportCount / ui.reports.length).toFixed(3) * 100) + '%';
    //504测试结果集
    let gatewayResults = gateway;
    //UI测试失败结果集
    let uiTestResults = actualFailed
    //破图扫描结果集
    let brokenResults = broken;
    //数据加载
    let loader = {
        runningProjectCount: runningProjectCount,
        runTestCaseCount: runTestCaseCount,
        failureReportCount: failureReportCount,
        successRate: successRate,
        gatewayResults: gatewayResults,
        uiTestResults: uiTestResults,
        brokenResults : brokenResults,
        search : search
    }
    let rendered = await template.render(loader)
    // tool.sendDailyReport(rendered.html);
    tool.sendDailyReportToPeople(rendered.html, 'lvchao@milanoo.com,wangzhihua@milanoo.com')
    return new Promise((res, rej) => {
        res(loader);
    })
}

/**
 * 作昨天统计报告
 */
emailreport.get('/report/send/', async(ctx, next) => {
    await makeReport();
    ctx.body = {
        success: true
    }
});

/**
 * 作某一天的统计报告,0代表今天
 */
emailreport.get('/report/send/:dateDiff', async(ctx, next) => {
    let dateDiff = ctx.params.dateDiff;
    await makeReport(dateDiff);
    ctx.body = {
        success: true
    }
});

module.exports = {
    emailreport: emailreport,
    makeReport: makeReport
};