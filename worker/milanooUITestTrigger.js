/**
 * Created by Administrator on 2017/4/21.
 */
const rp = require('request-promise');
const cheerio = require('cheerio');
const Promise = require('bluebird');
const fs = require('fs');
//触发用例的api - 测试站-英语站-回归测试
const invokeApi = 'http://192.168.12.104/Milanoo/system/scheduleJob/%e7%b1%b3%e5%85%b0%e8%8b%b1%e8%af%ad%e6%b5%8b%e8%af%95%e7%ab%99%e5%9b%9e%e5%bd%92%e7%94%a8%e4%be%8b%e9%9b%86/MILANOO/startNow'
//触发用例
let testEnv = () => {
    rp.get(invokeApi).then( (body) =>{
        console.log(body);
    });
}

module.exports = {
    testEnv : testEnv
}