/**
 * Created by Administrator on 2017/5/11.
 */
//http://www.alexa.com/find-similar-sites/data?site=https://serpworx.ticksy.com
//https://data.alexa.com/data?cli=10&url=github.com
const rp = require('request-promise')
const Router = require('koa-router');
const alexa = new Router();
const config = require('../config');
const moment = require('moment');
const logger = require('../tool').logger;
const parseString = require('xml2js').parseString;

/**
 * 解析xml并返回promise
 * @param xmlBody
 * @returns {Promise}
 */
let promisedParsing = xmlBody => {
    return new Promise((res, rej) => {
        parseString(xmlBody, function (err, result) {
            if (err) {
                rej(err)
            } else {
                res(result);
            }
        });
    });
}

/**
 * 查询网站的排名信息
 * @param url 目标链接
 */
let rank = async url => {
    let fullReq = 'https://data.alexa.com/data?cli=10&url=' + url;
    let xmlBody = await rp.get(fullReq);
    let parsedXml = await promisedParsing(xmlBody);
    if (parsedXml.ALEXA.$.URL == 404) {
        return {success: false, message: 404}
    } else {
        let trafficRank = parsedXml.ALEXA.SD[0].POPULARITY[0].$;
        let countryRank = parsedXml.ALEXA.SD[0].COUNTRY[0].$;
        let result = {alexaTrafficRank: trafficRank, localTrafficRank: countryRank}
        return result;
    }
}

let similar = async url => {
    let fullReq = 'http://www.alexa.com/find-similar-sites/data?site=' + url;
    let similars = await rp({uri: fullReq, method: 'get', json: true})
    let result = {similars: similars.results};
    return result;
}

let fetchAlexaMetrics = async(ctx) => {
    try {
        let url = ctx.query.link;
        let trafficRank = await rank(url);
        let similars = await similar(url);
        ctx.body = {success: true, trafficRank: trafficRank, similars: similars};
    } catch (err) {
        logger.error(err);
        ctx.body = {success: false, message: err}
    }
}
alexa.get('/alexa', fetchAlexaMetrics);

module.exports = {
    alexa: alexa
}



