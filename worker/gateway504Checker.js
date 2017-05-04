/**
 * Created by Administrator on 2017/4/27.
 */
const rp = require('request-promise')
const config = require('../config')
const target = config.gateway.target
const Promise = require('bluebird')
const df = require('../db/data-fetcher');

/**
 * 翻墙504测试
 * @param times
 */
let test504 = async(times) => {
    //初始数据入库
    let r = await df(`insert into gateway (g_time, g_result, g_date) values (${times}, '',now())`);
    //拿到自增id
    let insertId = r.insertId;
    let options = {
        proxy: config.gateway.proxy,
        uri: target,
        simple: false,
        resolvedWithFullResponse: true,
        method: 'GET'
    }
    let count = 0;
    let badResponse = [];
    let trigger = () => {
        return rp(options).then(response => {
            let status = response.statusCode;
            if (status > 400) {
                badResponse.push(status);
            }
            if (status == 504) {
                count++
            }
            return 0;
        })
    }
    for (let i = 0; i < times; i++) {
        await trigger();
    }
    let badCodes = badResponse.join(',');
    let query = 'update gateway g set g.g_result = ' + count + ', g.g_badresponse =' + (badCodes ? badCodes : null) + ' where g.id = ' + insertId;
    df(query)
}

/**
 * 从DB读取dateDiff天的测试结果，0表示当天
 * @param dateDiff
 */
let fetchResults = async(dateDiff) => {
    if (!dateDiff) {
        dateDiff = 0;
    }
    let query = 'SELECT * FROM gateway g WHERE DATEDIFF(g.g_date, NOW()) = ' + dateDiff
    let results = await df(query);
    return results;
    /*results.forEach((r, index, array) => {

     }); */
}

module.exports = {
    test504: test504,
    fetchResults: fetchResults
};