/**
 * Created by Administrator on 2017/4/21.
 */
const rp = require('request-promise');
const cheerio = require('cheerio');
const Promise = require('bluebird');
const fs = require('fs');
const df_ui = require('../db/data-fetcher-ui')
//触发用例的api - 测试站-英语站-回归测试
const invokeApi = 'http://192.168.12.104/Milanoo/system/scheduleJob/%e7%b1%b3%e5%85%b0%e8%8b%b1%e8%af%ad%e6%b5%8b%e8%af%95%e7%ab%99%e5%9b%9e%e5%bd%92%e7%94%a8%e4%be%8b%e9%9b%86/MILANOO/startNow'
//触发用例
let testEnv = () => {
    rp.get(invokeApi).then( (body) =>{
        console.log(body);
    });
}

let queryUiTestInfo = async() => {
    let QUERY_PROJECTS = 'select * from project p where p.status = 1';
    let QUERY_REPORTS = 'select * from task t where DATEDIFF(t.TIME, now()) = -1'
    let QUERY_FAILED = 'select t.PROJECTNAME, t.CASENAME, t.TIME, rts.PLAINPAGEOBJ, rts.KEYWORD, rts.PARAMETERS, rts.EXCEPTION from task t join runtimestep rts on t.ID = rts.TASKID where DATEDIFF(t.`TIME`, now()) = -1 and t.`STATUS` = 3 and rts.PASS = 2'
    let projects = await df_ui(QUERY_PROJECTS)
    let reports = await df_ui(QUERY_REPORTS)
    let failedTests = await df_ui(QUERY_FAILED);
    return {
        projects: projects,
        reports: reports,
        failedTests: failedTests
    }
}

module.exports = {
    testEnv : testEnv,
    queryUiTestInfo: queryUiTestInfo
}